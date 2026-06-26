import { redirect } from "next/navigation";

import { CatalogAdminManager } from "@/components/dashboard/catalog-admin-manager";
import { DoctorApplicationsManager } from "@/components/dashboard/doctor-applications-manager";
import { SearchStatsPanel } from "@/components/dashboard/search-stats-panel";
import { TriageManager } from "@/components/dashboard/triage-manager";
import { getSession } from "@/lib/auth";
import { ensureInitialCatalogSeed } from "@/lib/default-catalog-seed";
import { connectToDatabase } from "@/lib/mongodb";
import { isSuperAdminEmail } from "@/lib/superadmin";
import { DoctorApplicationModel } from "@/models/DoctorApplication";
import { ProcedureModel } from "@/models/Procedure";
import { SearchEventModel } from "@/models/SearchEvent";
import { SpecialtyModel } from "@/models/Specialty";
import { TriageModel } from "@/models/Triage";

type DashboardPageProps = {
  searchParams: Promise<{
    especialidade?: string;
    cidade?: string;
    status?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/dashboard/login");
  }

  const filters = await searchParams;

  await connectToDatabase();
  await ensureInitialCatalogSeed();
  const isSuperAdmin = isSuperAdminEmail(session.email);

  const query: Record<string, string> = {};
  if (filters.especialidade) {
    query.especialidadeSlug = filters.especialidade;
  }
  if (filters.cidade) {
    query.cidadeSlug = filters.cidade;
  }
  if (filters.status) {
    query.status = filters.status;
  }

  const triagens = await TriageModel.find(query).sort({ createdAt: -1 }).limit(120).lean();
  const [
    doctorApplications,
    totalSearches,
    withPriceEstimate,
    withoutPriceEstimate,
    topCitiesRaw,
    topProceduresRaw,
    adminSpecialties,
    adminProcedures,
  ] = await Promise.all([
    DoctorApplicationModel.find({}).sort({ createdAt: -1 }).limit(120).lean(),
    SearchEventModel.countDocuments(),
    SearchEventModel.countDocuments({ hasPriceEstimate: true }),
    SearchEventModel.countDocuments({ hasPriceEstimate: false }),
    SearchEventModel.aggregate([
      {
        $group: {
          _id: {
            cidadeNome: "$cidadeNome",
            uf: "$uf",
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),
    SearchEventModel.aggregate([
      {
        $group: {
          _id: "$procedimentoSlug",
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),
    isSuperAdmin ? SpecialtyModel.find({}).sort({ nome: 1 }).lean() : Promise.resolve([]),
    isSuperAdmin ? ProcedureModel.find({}).sort({ nome: 1 }).lean() : Promise.resolve([]),
  ]);

  const topCities = (topCitiesRaw as Array<{ _id?: { cidadeNome?: string; uf?: string }; total: number }>).map(
    (item) => ({
      label: `${item._id?.cidadeNome ?? "Cidade"}${item._id?.uf ? ` - ${item._id.uf}` : ""}`,
      total: item.total,
    }),
  );
  const topProcedures = (
    topProceduresRaw as Array<{ _id?: string; total: number }>
  ).map((item) => ({
    label: (item._id ?? "procedimento").replace(/[-_]/g, " "),
    total: item.total,
  }));

  return (
    <main className="grid gap-4">
      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Especialidade
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="especialidade"
            defaultValue={filters.especialidade}
            placeholder="cirurgia-geral"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Cidade
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="cidade"
            defaultValue={filters.cidade}
            placeholder="itapetininga"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Status
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos</option>
            <option value="novo">novo</option>
            <option value="em-analise">em-analise</option>
            <option value="contato-realizado">contato-realizado</option>
            <option value="encerrado">encerrado</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
          >
            Filtrar triagens
          </button>
        </div>
      </form>

      <TriageManager
        doctorName={session.name}
        triagens={triagens.map((triagem) => ({
          id: String(triagem._id),
          especialidadeSlug: triagem.especialidadeSlug,
          procedimentoSlug: triagem.procedimentoSlug,
          cidadeSlug: triagem.cidadeSlug,
          doctorReferral: triagem.doctorReferral
            ? {
                doctorApplicationId: triagem.doctorReferral.doctorApplicationId,
                doctorName: triagem.doctorReferral.doctorName,
              }
            : undefined,
          status: triagem.status,
          createdAt: triagem.createdAt?.toISOString() ?? new Date().toISOString(),
          encryptedPayload: {
            iv: triagem.encryptedPayload.iv,
            encryptedDataBase64: triagem.encryptedPayload.encryptedDataBase64,
            encryptedSymmetricKeyBase64: triagem.encryptedPayload.encryptedSymmetricKeyBase64,
          },
          attachment: {
            objectPath: triagem.attachment.objectPath,
            originalFileName: triagem.attachment.originalFileName,
            originalMimeType: triagem.attachment.originalMimeType,
            encryption: {
              iv: triagem.attachment.encryption.iv,
            },
          },
        }))}
      />

      <DoctorApplicationsManager
        initialApplications={doctorApplications.map((application) => ({
          id: String(application._id),
          nome: application.nome,
          email: application.email,
          telefone: application.telefone,
          crm: application.crm,
          crmUf: application.crmUf,
          status: application.status,
          activeForPublicListing: application.activeForPublicListing,
          procedimentosRealizados: application.procedimentosRealizados,
          certidaoRegularidadeObjectPath: application.certidaoRegularidadeObjectPath,
          fotoObjectPath: application.fotoObjectPath,
          practiceAddresses: application.practiceAddresses ?? [],
          procedurePricing: application.procedurePricing,
          createdAt: application.createdAt?.toISOString() ?? new Date().toISOString(),
          review: application.review,
        }))}
      />

      <SearchStatsPanel
        totalSearches={totalSearches}
        withPriceEstimate={withPriceEstimate}
        withoutPriceEstimate={withoutPriceEstimate}
        topCities={topCities}
        topProcedures={topProcedures}
      />

      {isSuperAdmin ? (
        <CatalogAdminManager
          initialSpecialties={(adminSpecialties as Array<{
            _id: unknown;
            slug: string;
            nome: string;
            descricao: string;
            active: boolean;
          }>).map((specialty) => ({
            id: String(specialty._id),
            slug: specialty.slug,
            nome: specialty.nome,
            descricao: specialty.descricao,
            active: specialty.active,
          }))}
          initialProcedures={(adminProcedures as Array<{
            _id: unknown;
            slug: string;
            especialidadeSlug: string;
            nome: string;
            descricao: string;
            active: boolean;
          }>).map((procedure) => ({
            id: String(procedure._id),
            slug: procedure.slug,
            especialidadeSlug: procedure.especialidadeSlug,
            nome: procedure.nome,
            descricao: procedure.descricao,
            active: procedure.active,
          }))}
        />
      ) : null}
    </main>
  );
}
