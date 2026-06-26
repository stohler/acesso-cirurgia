import { ProcedureModel } from "@/models/Procedure";
import { SpecialtyModel } from "@/models/Specialty";

type SeedSpecialty = {
  slug: string;
  nome: string;
  descricao: string;
};

type SeedProcedure = {
  slug: string;
  especialidadeSlug: string;
  nome: string;
  descricao: string;
};

const INITIAL_SPECIALTIES: SeedSpecialty[] = [
  {
    slug: "cirurgia-geral",
    nome: "Cirurgia geral",
    descricao: "Procedimentos cirúrgicos gerais com foco em segurança e recuperação assistida.",
  },
  {
    slug: "ginecologia",
    nome: "Ginecologia",
    descricao: "Procedimentos ginecológicos com abordagem clínica e cirúrgica especializada.",
  },
  {
    slug: "ortopedia",
    nome: "Ortopedia",
    descricao: "Procedimentos ortopédicos para articulações, ossos, tendões e reabilitação funcional.",
  },
];

const INITIAL_PROCEDURES: SeedProcedure[] = [
  // Cirurgia Geral
  { slug: "colecistectomia_laparo", especialidadeSlug: "cirurgia-geral", nome: "Colecistectomia por Videolaparoscopia", descricao: "Colecistectomia por videolaparoscopia." },
  { slug: "colecistectomia_aberta", especialidadeSlug: "cirurgia-geral", nome: "Colecistectomia Aberta (Convencional)", descricao: "Colecistectomia aberta convencional." },
  { slug: "hernioplastia_inguinal_laparo", especialidadeSlug: "cirurgia-geral", nome: "Hernioplastia Inguinal por Videolaparoscopia", descricao: "Hernioplastia inguinal por videolaparoscopia." },
  { slug: "hernioplastia_inguinal_aberta", especialidadeSlug: "cirurgia-geral", nome: "Hernioplastia Inguinal Aberta (Convencional)", descricao: "Hernioplastia inguinal aberta convencional." },
  { slug: "hernioplastia_umbilical", especialidadeSlug: "cirurgia-geral", nome: "Hernioplastia Umbilical", descricao: "Hernioplastia umbilical." },
  { slug: "hernioplastia_incisional_laparo", especialidadeSlug: "cirurgia-geral", nome: "Hernioplastia Incisional por Videolaparoscopia", descricao: "Hernioplastia incisional por videolaparoscopia." },
  { slug: "hernioplastia_incisional_aberta", especialidadeSlug: "cirurgia-geral", nome: "Hernioplastia Incisional Aberta (Convencional)", descricao: "Hernioplastia incisional aberta convencional." },
  { slug: "esofagofundoplicatura_laparo", especialidadeSlug: "cirurgia-geral", nome: "Esofagofundoplicatura por Videolaparoscopia (Refluxo)", descricao: "Esofagofundoplicatura por videolaparoscopia para refluxo." },
  { slug: "tireoidectomia", especialidadeSlug: "cirurgia-geral", nome: "Tireoidectomia (Remoção da Tireoide)", descricao: "Tireoidectomia para remoção parcial ou total da tireoide." },
  { slug: "hemorroidectomia", especialidadeSlug: "cirurgia-geral", nome: "Hemorroidectomia / Fissectomia", descricao: "Hemorroidectomia e procedimentos correlatos." },
  { slug: "exerese_lipoma_cisto", especialidadeSlug: "cirurgia-geral", nome: "Exérese de Lipoma ou Cisto Sebáceo", descricao: "Exérese de lipoma ou cisto sebáceo." },

  // Ginecologia
  { slug: "histerectomia_laparo", especialidadeSlug: "ginecologia", nome: "Histerectomia por Videolaparoscopia", descricao: "Histerectomia por videolaparoscopia." },
  { slug: "histerectomia_aberta", especialidadeSlug: "ginecologia", nome: "Histerectomia Total Abdominal (Aberta)", descricao: "Histerectomia total abdominal aberta." },
  { slug: "histerectomia_vaginal", especialidadeSlug: "ginecologia", nome: "Histerectomia Vaginal", descricao: "Histerectomia vaginal." },
  { slug: "miomectomia_laparo", especialidadeSlug: "ginecologia", nome: "Miomectomia por Videolaparoscopia", descricao: "Miomectomia por videolaparoscopia." },
  { slug: "miomectomia_aberta", especialidadeSlug: "ginecologia", nome: "Miomectomia Abdominal Aberta (Convencional)", descricao: "Miomectomia abdominal aberta." },
  { slug: "ooforectomia_laparo", especialidadeSlug: "ginecologia", nome: "Ooforectomia / Anexectomia por Videolaparoscopia", descricao: "Ooforectomia ou anexectomia por videolaparoscopia." },
  { slug: "ooforectomia_aberta", especialidadeSlug: "ginecologia", nome: "Ooforectomia / Anexectomia Aberta (Convencional)", descricao: "Ooforectomia ou anexectomia aberta convencional." },
  { slug: "laparoscopia_ginecologica", especialidadeSlug: "ginecologia", nome: "Laparoscopia Ginecológica Diagnóstica/Terapêutica", descricao: "Laparoscopia ginecológica diagnóstica e terapêutica." },
  { slug: "laqueadura_tubaria_laparo", especialidadeSlug: "ginecologia", nome: "Laqueadura Tubária por Videolaparoscopia", descricao: "Laqueadura tubária por videolaparoscopia." },
  { slug: "laqueadura_tubaria_aberta", especialidadeSlug: "ginecologia", nome: "Laqueadura Tubária Aberta (Minilaparotomia)", descricao: "Laqueadura tubária aberta por minilaparotomia." },
  { slug: "histeroscopia_cirurgica", especialidadeSlug: "ginecologia", nome: "Histeroscopia Cirúrgica", descricao: "Histeroscopia cirúrgica." },
  { slug: "perineoplastia", especialidadeSlug: "ginecologia", nome: "Perineoplastia (Correção de Prolapso)", descricao: "Perineoplastia para correção de prolapso." },
  { slug: "conizacao_colo", especialidadeSlug: "ginecologia", nome: "Conização do Colo Uterino", descricao: "Conização do colo uterino." },

  // Ortopedia
  { slug: "artroplastia_quadril", especialidadeSlug: "ortopedia", nome: "Artroplastia Total de Quadril (Prótese)", descricao: "Artroplastia total de quadril com prótese." },
  { slug: "artroplastia_joelho", especialidadeSlug: "ortopedia", nome: "Artroplastia Total de Joelho (Prótese)", descricao: "Artroplastia total de joelho com prótese." },
  { slug: "artroscopia_joelho", especialidadeSlug: "ortopedia", nome: "Artroscopia de Joelho (Menisco / LCA)", descricao: "Artroscopia de joelho para menisco e LCA." },
  { slug: "artroscopia_ombro", especialidadeSlug: "ortopedia", nome: "Artroscopia de Ombro (Manguito Rotador)", descricao: "Artroscopia de ombro para manguito rotador." },
  { slug: "tunel_do_carpo", especialidadeSlug: "ortopedia", nome: "Descompressão do Túnel do Carpo", descricao: "Descompressão cirúrgica do túnel do carpo." },
  { slug: "reparo_tendao", especialidadeSlug: "ortopedia", nome: "Tenoplastia / Reparo de Tendão (ex: Aquiles)", descricao: "Tenoplastia e reparo de tendão." },
  { slug: "correcao_halux_valgo", especialidadeSlug: "ortopedia", nome: "Correção de Hálux Valgo (Joanete)", descricao: "Correção cirúrgica de hálux valgo." },
  { slug: "retirada_material_sintese", especialidadeSlug: "ortopedia", nome: "Retirada de Material de Síntese (Placas/Parafusos)", descricao: "Retirada de material de síntese ortopédico." },
  { slug: "exerese_cisto_sinovial", especialidadeSlug: "ortopedia", nome: "Exérese de Cisto Sinovial", descricao: "Exérese de cisto sinovial." },
];

let hasEnsuredInitialCatalog = false;

export async function ensureInitialCatalogSeed() {
  if (hasEnsuredInitialCatalog) {
    return;
  }

  await SpecialtyModel.bulkWrite(
    INITIAL_SPECIALTIES.map((specialty) => ({
      updateOne: {
        filter: { slug: specialty.slug },
        update: {
          $setOnInsert: specialty,
        },
        upsert: true,
      },
    })),
  );

  await ProcedureModel.bulkWrite(
    INITIAL_PROCEDURES.map((procedure) => ({
      updateOne: {
        filter: { slug: procedure.slug, especialidadeSlug: procedure.especialidadeSlug },
        update: {
          $setOnInsert: procedure,
        },
        upsert: true,
      },
    })),
  );

  hasEnsuredInitialCatalog = true;
}
