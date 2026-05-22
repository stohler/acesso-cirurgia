import crypto from "node:crypto";

import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_PRICE_ESTIMATES } from "@/lib/constants";
import { DoctorApplicationModel } from "@/models/DoctorApplication";
import { SearchEventModel } from "@/models/SearchEvent";

type DoctorCard = {
  id: string;
  nome: string;
  crm: string;
  crmUf: string;
  telefone: string;
  procedimentosRealizados: string[];
  cidadeSlug: string;
  cidadeNome: string;
  uf: string;
  enderecoProcedimento: string;
  valorMedioPacote: number;
};

type ProcedurePricingItem = {
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
  cidadeNome: string;
  uf: string;
  enderecoProcedimento: string;
  valorMedioPacote: number;
};

const FALLBACK_DOCTORS: DoctorCard[] = [
  {
    id: "fallback-dr-andre-itapetininga-vesicula",
    nome: "Dr. André Souza",
    crm: "123456",
    crmUf: "SP",
    telefone: "(15) 99111-2200",
    procedimentosRealizados: ["vesicula", "hernia-inguinal"],
    cidadeSlug: "itapetininga",
    cidadeNome: "Itapetininga",
    uf: "SP",
    enderecoProcedimento: "Hospital Parceiro Centro - Itapetininga/SP",
    valorMedioPacote: 13900,
  },
  {
    id: "fallback-dra-camila-sorocaba-vesicula",
    nome: "Dra. Camila Fernandes",
    crm: "234567",
    crmUf: "SP",
    telefone: "(15) 99222-3300",
    procedimentosRealizados: ["vesicula", "hemorroida"],
    cidadeSlug: "sorocaba",
    cidadeNome: "Sorocaba",
    uf: "SP",
    enderecoProcedimento: "Hospital Dia Sul - Sorocaba/SP",
    valorMedioPacote: 15700,
  },
];

export async function getLocalDoctors(params: {
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
  cidadeNome: string;
  uf: string;
}) {
  try {
    await connectToDatabase();

    const applications = await DoctorApplicationModel.find({
      status: "aprovado",
      activeForPublicListing: true,
      procedurePricing: {
        $elemMatch: {
          especialidadeSlug: params.especialidadeSlug,
          procedimentoSlug: params.procedimentoSlug,
          cidadeSlug: params.cidadeSlug,
        },
      },
    }).lean();

    const cards = applications
      .map((application) => {
        const pricingList = application.procedurePricing as ProcedurePricingItem[];
        const selectedPricing = pricingList.find(
          (pricing: ProcedurePricingItem) =>
            pricing.especialidadeSlug === params.especialidadeSlug &&
            pricing.procedimentoSlug === params.procedimentoSlug &&
            pricing.cidadeSlug === params.cidadeSlug,
        );

        if (!selectedPricing) {
          return null;
        }

        return {
          id: String(application._id),
          nome: application.nome,
          crm: application.crm,
          crmUf: application.crmUf,
          telefone: application.telefone,
          procedimentosRealizados: application.procedimentosRealizados,
          cidadeSlug: selectedPricing.cidadeSlug,
          cidadeNome: selectedPricing.cidadeNome,
          uf: selectedPricing.uf,
          enderecoProcedimento: selectedPricing.enderecoProcedimento,
          valorMedioPacote: selectedPricing.valorMedioPacote,
        } satisfies DoctorCard;
      })
      .filter((item): item is DoctorCard => item !== null);

    return cards;
  } catch {
    return FALLBACK_DOCTORS.filter(
      (doctor) =>
        doctor.cidadeSlug === params.cidadeSlug &&
        doctor.procedimentosRealizados.includes(params.procedimentoSlug),
    );
  }
}

export function isPriceEstimateRegistered(params: {
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
}) {
  return DEFAULT_PRICE_ESTIMATES.some(
    (item) =>
      item.especialidadeSlug === params.especialidadeSlug &&
      item.procedimentoSlug === params.procedimentoSlug &&
      item.cidadeSlug === params.cidadeSlug,
  );
}

export async function registerSearchEvent(params: {
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
  cidadeNome: string;
  uf: string;
  hasPriceEstimate: boolean;
  doctorsFound: number;
  userAgent?: string | null;
  ip?: string | null;
}) {
  try {
    await connectToDatabase();
    await SearchEventModel.create({
      especialidadeSlug: params.especialidadeSlug,
      procedimentoSlug: params.procedimentoSlug,
      cidadeSlug: params.cidadeSlug,
      cidadeNome: params.cidadeNome,
      uf: params.uf,
      hasPriceEstimate: params.hasPriceEstimate,
      doctorsFound: params.doctorsFound,
      source: "landing-route",
      metadata: {
        userAgent: params.userAgent ?? undefined,
        ipHash: params.ip
          ? crypto.createHash("sha256").update(params.ip).digest("hex")
          : undefined,
      },
    });
  } catch {
    // Estatística não pode quebrar resposta da página.
  }
}
