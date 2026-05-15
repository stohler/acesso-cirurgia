import type {
  CityCatalog,
  PriceEstimateCatalog,
  ProcedureCatalog,
  SpecialtyCatalog,
} from "@/lib/types";

export const PRICE_DISCLAIMER =
  "Os valores exibidos são estimativas de pacote padrão e podem variar após avaliação clínica presencial, exames complementares e definição de equipe/hospital.";

export const DEFAULT_SPECIALTIES: SpecialtyCatalog[] = [
  {
    slug: "cirurgia-geral",
    nome: "Cirurgia Geral",
    descricao: "Atendimento cirúrgico eletivo e resolutivo para procedimentos abdominais e de parede.",
  },
];

export const DEFAULT_PROCEDURES: ProcedureCatalog[] = [
  {
    slug: "vesicula",
    especialidadeSlug: "cirurgia-geral",
    nome: "Cirurgia de Vesícula (Colecistectomia)",
    descricao: "Remoção da vesícula para casos de cálculos, inflamação ou crises recorrentes.",
  },
  {
    slug: "hernia-inguinal",
    especialidadeSlug: "cirurgia-geral",
    nome: "Hérnia Inguinal",
    descricao: "Correção de hérnia com técnicas abertas ou videolaparoscópicas.",
  },
  {
    slug: "hemorroida",
    especialidadeSlug: "cirurgia-geral",
    nome: "Tratamento Cirúrgico de Hemorroida",
    descricao: "Abordagem para sintomas persistentes, dor e sangramento frequente.",
  },
];

export const DEFAULT_CITIES: CityCatalog[] = [
  { slug: "itapetininga", nome: "Itapetininga", uf: "SP" },
  { slug: "sorocaba", nome: "Sorocaba", uf: "SP" },
  { slug: "tatui", nome: "Tatuí", uf: "SP" },
  { slug: "itu", nome: "Itu", uf: "SP" },
  { slug: "boituva", nome: "Boituva", uf: "SP" },
];

export const DEFAULT_PRICE_ESTIMATES: PriceEstimateCatalog[] = [
  {
    especialidadeSlug: "cirurgia-geral",
    procedimentoSlug: "vesicula",
    cidadeSlug: "itapetininga",
    cidadeNome: "Itapetininga",
    uf: "SP",
    pacote: "Pacote padrão (hospital + equipe + materiais básicos)",
    precoMinimo: 11500,
    precoMaximo: 16800,
    atualizadoEm: "2026-05-01",
  },
  {
    especialidadeSlug: "cirurgia-geral",
    procedimentoSlug: "vesicula",
    cidadeSlug: "sorocaba",
    cidadeNome: "Sorocaba",
    uf: "SP",
    pacote: "Pacote padrão (hospital + equipe + materiais básicos)",
    precoMinimo: 12800,
    precoMaximo: 18900,
    atualizadoEm: "2026-05-01",
  },
  {
    especialidadeSlug: "cirurgia-geral",
    procedimentoSlug: "hernia-inguinal",
    cidadeSlug: "itapetininga",
    cidadeNome: "Itapetininga",
    uf: "SP",
    pacote: "Pacote padrão (hospital + equipe + materiais básicos)",
    precoMinimo: 9800,
    precoMaximo: 14900,
    atualizadoEm: "2026-05-01",
  },
  {
    especialidadeSlug: "cirurgia-geral",
    procedimentoSlug: "hemorroida",
    cidadeSlug: "itapetininga",
    cidadeNome: "Itapetininga",
    uf: "SP",
    pacote: "Pacote padrão (hospital + equipe + materiais básicos)",
    precoMinimo: 8200,
    precoMaximo: 13200,
    atualizadoEm: "2026-05-01",
  },
];
