import { connectToDatabase } from "@/lib/mongodb";
import { toSlug } from "@/lib/utils";
import { CityModel } from "@/models/City";
import { DoctorApplicationModel } from "@/models/DoctorApplication";
import { PriceEstimateModel } from "@/models/PriceEstimate";
import { ProcedureModel } from "@/models/Procedure";
import { SpecialtyModel } from "@/models/Specialty";

type ProcedurePricingItem = {
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
  cidadeNome: string;
  uf: string;
  enderecoProcedimento: string;
  valorMedioPacote: number;
};

type PracticeAddressItem = {
  uf: string;
  cidadeSlug: string;
  cidadeNome: string;
  enderecoProcedimento: string;
  procedures: Array<{
    especialidadeSlug: string;
    procedimentoSlug: string;
    valorMedioPacote: number;
  }>;
};

type SyncableDoctorApplication = {
  procedurePricing?: ProcedurePricingItem[] | null;
  practiceAddresses?: PracticeAddressItem[] | null;
};

function slugToLabel(slug: string) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizePricingItem(item: ProcedurePricingItem) {
  return {
    especialidadeSlug: item.especialidadeSlug.trim().toLowerCase(),
    procedimentoSlug: item.procedimentoSlug.trim().toLowerCase(),
    cidadeSlug: (item.cidadeSlug || toSlug(item.cidadeNome)).trim().toLowerCase(),
    cidadeNome: item.cidadeNome.trim(),
    uf: item.uf.trim().toUpperCase(),
    valorMedioPacote: Number(item.valorMedioPacote),
  };
}

async function ensureCatalogReferences(item: ReturnType<typeof normalizePricingItem>) {
  await SpecialtyModel.updateOne(
    { slug: item.especialidadeSlug },
    {
      $setOnInsert: {
        nome: slugToLabel(item.especialidadeSlug),
        descricao: "Especialidade disponibilizada por médicos parceiros aprovados.",
      },
      $set: { active: true },
    },
    { upsert: true },
  );

  await ProcedureModel.updateOne(
    { slug: item.procedimentoSlug, especialidadeSlug: item.especialidadeSlug },
    {
      $setOnInsert: {
        nome: slugToLabel(item.procedimentoSlug),
        descricao: "Procedimento disponibilizado por médicos parceiros aprovados.",
      },
      $set: { active: true },
    },
    { upsert: true },
  );

  await CityModel.updateOne(
    { slug: item.cidadeSlug },
    {
      $set: {
        nome: item.cidadeNome,
        uf: item.uf,
        active: true,
      },
    },
    { upsert: true },
  );
}

async function recomputePriceEstimate(item: ReturnType<typeof normalizePricingItem>) {
  const approvedApplications = await DoctorApplicationModel.find({
    status: "aprovado",
    activeForPublicListing: true,
    procedurePricing: {
      $elemMatch: {
        especialidadeSlug: item.especialidadeSlug,
        procedimentoSlug: item.procedimentoSlug,
        cidadeSlug: item.cidadeSlug,
        uf: item.uf,
      },
    },
  }).lean();

  const prices: number[] = [];
  let cityName = item.cidadeNome;

  for (const application of approvedApplications) {
    const pricingList = (application.procedurePricing ?? []) as ProcedurePricingItem[];
    const matched = pricingList.find(
      (pricing) =>
        pricing.especialidadeSlug === item.especialidadeSlug &&
        pricing.procedimentoSlug === item.procedimentoSlug &&
        pricing.cidadeSlug === item.cidadeSlug &&
        pricing.uf.toUpperCase() === item.uf,
    );

    if (!matched) {
      continue;
    }

    if (matched.cidadeNome) {
      cityName = matched.cidadeNome;
    }

    const value = Number(matched.valorMedioPacote);
    if (Number.isFinite(value) && value > 0) {
      prices.push(value);
    }
  }

  const filter = {
    especialidadeSlug: item.especialidadeSlug,
    procedimentoSlug: item.procedimentoSlug,
    cidadeSlug: item.cidadeSlug,
  };

  if (prices.length === 0) {
    await PriceEstimateModel.updateOne(filter, { $set: { active: false } });
    return;
  }

  const precoMinimo = Math.min(...prices);
  const precoMaximo = Math.max(...prices);

  await PriceEstimateModel.updateOne(
    filter,
    {
      $set: {
        especialidadeSlug: item.especialidadeSlug,
        procedimentoSlug: item.procedimentoSlug,
        cidadeSlug: item.cidadeSlug,
        cidadeNome: cityName,
        uf: item.uf,
        pacote: `Faixa estimada com base nos últimos médicos parceiros aprovados para ${slugToLabel(item.procedimentoSlug)} em ${cityName}/${item.uf}.`,
        precoMinimo,
        precoMaximo,
        active: true,
      },
    },
    { upsert: true },
  );
}

export async function syncDoctorApplicationApproval(application: SyncableDoctorApplication) {
  await connectToDatabase();

  const pricingRows =
    ((application.procedurePricing ?? []) as ProcedurePricingItem[]).length > 0
      ? ((application.procedurePricing ?? []) as ProcedurePricingItem[])
      : (((application.practiceAddresses ?? []) as PracticeAddressItem[]).flatMap((address) =>
          (address.procedures ?? []).map((procedure) => ({
            especialidadeSlug: procedure.especialidadeSlug,
            procedimentoSlug: procedure.procedimentoSlug,
            cidadeSlug: address.cidadeSlug,
            cidadeNome: address.cidadeNome,
            uf: address.uf,
            enderecoProcedimento: address.enderecoProcedimento,
            valorMedioPacote: procedure.valorMedioPacote,
          })),
        ) as ProcedurePricingItem[]);
  const uniqueItems = new Map<string, ReturnType<typeof normalizePricingItem>>();

  for (const rawItem of pricingRows) {
    if (!rawItem?.especialidadeSlug || !rawItem?.procedimentoSlug || !rawItem?.cidadeNome || !rawItem?.uf) {
      continue;
    }

    const normalized = normalizePricingItem(rawItem);
    if (!normalized.cidadeSlug || !Number.isFinite(normalized.valorMedioPacote) || normalized.valorMedioPacote <= 0) {
      continue;
    }

    const key = `${normalized.especialidadeSlug}|${normalized.procedimentoSlug}|${normalized.cidadeSlug}|${normalized.uf}`;
    uniqueItems.set(key, normalized);
  }

  for (const item of uniqueItems.values()) {
    await ensureCatalogReferences(item);
    await recomputePriceEstimate(item);
  }
}
