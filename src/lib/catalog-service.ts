import { DEFAULT_CITIES, DEFAULT_PRICE_ESTIMATES, DEFAULT_PROCEDURES, DEFAULT_SPECIALTIES } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { CityModel } from "@/models/City";
import { PriceEstimateModel } from "@/models/PriceEstimate";
import { ProcedureModel } from "@/models/Procedure";
import { SpecialtyModel } from "@/models/Specialty";

export async function getCatalogData() {
  try {
    await connectToDatabase();

    const [specialties, procedures, cities] = await Promise.all([
      SpecialtyModel.find({ active: true }).lean(),
      ProcedureModel.find({ active: true }).lean(),
      CityModel.find({ active: true }).lean(),
    ]);

    return {
      specialties: specialties.length
        ? specialties.map((item) => ({
            slug: item.slug,
            nome: item.nome,
            descricao: item.descricao,
          }))
        : DEFAULT_SPECIALTIES,
      procedures: procedures.length
        ? procedures.map((item) => ({
            slug: item.slug,
            especialidadeSlug: item.especialidadeSlug,
            nome: item.nome,
            descricao: item.descricao,
          }))
        : DEFAULT_PROCEDURES,
      cities: cities.length
        ? cities.map((item) => ({
            slug: item.slug,
            nome: item.nome,
            uf: item.uf,
          }))
        : DEFAULT_CITIES,
    };
  } catch {
    return {
      specialties: DEFAULT_SPECIALTIES,
      procedures: DEFAULT_PROCEDURES,
      cities: DEFAULT_CITIES,
    };
  }
}

export async function findPriceEstimate(especialidade: string, procedimento: string, cidade: string) {
  try {
    await connectToDatabase();

    const estimate = await PriceEstimateModel.findOne({
      especialidadeSlug: especialidade,
      procedimentoSlug: procedimento,
      cidadeSlug: cidade,
      active: true,
    }).lean();

    if (estimate) {
      return {
        especialidadeSlug: estimate.especialidadeSlug,
        procedimentoSlug: estimate.procedimentoSlug,
        cidadeSlug: estimate.cidadeSlug,
        cidadeNome: estimate.cidadeNome,
        uf: estimate.uf,
        pacote: estimate.pacote,
        precoMinimo: estimate.precoMinimo,
        precoMaximo: estimate.precoMaximo,
        atualizadoEm: estimate.updatedAt?.toISOString() ?? new Date().toISOString(),
      };
    }
  } catch {
    // fallback abaixo
  }

  return (
    DEFAULT_PRICE_ESTIMATES.find(
      (item) =>
        item.especialidadeSlug === especialidade &&
        item.procedimentoSlug === procedimento &&
        item.cidadeSlug === cidade,
    ) ?? null
  );
}

export async function getFeaturedPriceEstimates(limit = 6) {
  try {
    await connectToDatabase();

    const estimates = await PriceEstimateModel.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (estimates.length > 0) {
      return estimates.map((estimate) => ({
        especialidadeSlug: estimate.especialidadeSlug,
        procedimentoSlug: estimate.procedimentoSlug,
        cidadeSlug: estimate.cidadeSlug,
        cidadeNome: estimate.cidadeNome,
        uf: estimate.uf,
        pacote: estimate.pacote,
        precoMinimo: estimate.precoMinimo,
        precoMaximo: estimate.precoMaximo,
      }));
    }
  } catch {
    // fallback para defaults abaixo
  }

  return DEFAULT_PRICE_ESTIMATES.slice(0, limit);
}
