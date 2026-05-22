import { redirect } from "next/navigation";

import { DoctorApplicationsManager } from "@/components/dashboard/doctor-applications-manager";
import { TriageManager } from "@/components/dashboard/triage-manager";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { DoctorApplicationModel } from "@/models/DoctorApplication";
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
  const doctorApplications = await DoctorApplicationModel.find({})
    .sort({ createdAt: -1 })
    .limit(120)
    .lean();

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
          procedurePricing: application.procedurePricing,
          createdAt: application.createdAt?.toISOString() ?? new Date().toISOString(),
          review: application.review,
        }))}
      />
    </main>
  );
}
