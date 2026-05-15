export type SpecialtyCatalog = {
  slug: string;
  nome: string;
  descricao: string;
};

export type ProcedureCatalog = {
  slug: string;
  especialidadeSlug: string;
  nome: string;
  descricao: string;
};

export type CityCatalog = {
  slug: string;
  nome: string;
  uf: string;
};

export type PriceEstimateCatalog = {
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
  cidadeNome: string;
  uf: string;
  pacote: string;
  precoMinimo: number;
  precoMaximo: number;
  atualizadoEm: string;
};

export type DashboardRegion = {
  cidadeSlug: string;
  uf: string;
};
