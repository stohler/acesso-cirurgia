"use client";

import { useState } from "react";

type DoctorApplicationRow = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  crm: string;
  crmUf: string;
  status: "pendente" | "aprovado" | "rejeitado";
  activeForPublicListing: boolean;
  procedimentosRealizados: string[];
  certidaoRegularidadeObjectPath: string;
  fotoObjectPath?: string;
  procedurePricing: Array<{
    especialidadeSlug: string;
    procedimentoSlug: string;
    cidadeSlug: string;
    cidadeNome: string;
    uf: string;
    enderecoProcedimento: string;
    valorMedioPacote: number;
  }>;
  createdAt: string;
  review?: {
    notes?: string;
  };
};

type DoctorApplicationsManagerProps = {
  initialApplications: DoctorApplicationRow[];
};

export function DoctorApplicationsManager({ initialApplications }: DoctorApplicationsManagerProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [statusMessage, setStatusMessage] = useState("");

  async function updateStatus(id: string, status: "aprovado" | "rejeitado") {
    setStatusMessage("Atualizando solicitação...");
    try {
      const response = await fetch(`/api/admin/doctor-applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar status.");
      }

      setApplications((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, activeForPublicListing: status === "aprovado" }
            : item,
        ),
      );
      setStatusMessage(`Solicitação marcada como ${status}.`);
    } catch (error) {
      setStatusMessage(`Erro: ${String(error)}`);
    }
  }

  return (
    <section className="grid gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Solicitações de vínculo médico</h2>
        <p className="text-sm text-slate-600">
          Workflow de aprovação/reprovação para exibição de médicos na página pública.
        </p>
        {statusMessage ? <p className="mt-2 text-xs text-slate-700">{statusMessage}</p> : null}
      </header>

      <div className="grid gap-3">
        {applications.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            Nenhuma solicitação cadastrada até o momento.
          </p>
        ) : null}

        {applications.map((application) => (
          <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {application.nome} • CRM {application.crm}-{application.crmUf}
                </h3>
                <p className="text-xs text-slate-600">
                  {application.email} • {application.telefone}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Status: <strong>{application.status}</strong> • Cadastro em{" "}
                  {new Date(application.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(application.id, "aprovado")}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(application.id, "rejeitado")}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Rejeitar
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-slate-700 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">Procedimentos da equipe</p>
                <p className="mt-1">{application.procedimentosRealizados.join(", ") || "Não informado"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">Documentos</p>
                <p className="mt-1">Certidão: {application.certidaoRegularidadeObjectPath}</p>
                <p>Foto: {application.fotoObjectPath ?? "Não enviada"}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {application.procedurePricing.map((pricing, index) => (
                <div key={`${application.id}-${pricing.cidadeSlug}-${index}`} className="rounded-lg border border-slate-200 p-2 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {pricing.especialidadeSlug} / {pricing.procedimentoSlug}
                  </p>
                  <p>
                    {pricing.cidadeNome}-{pricing.uf} • {pricing.enderecoProcedimento}
                  </p>
                  <p>Valor médio: R$ {pricing.valorMedioPacote.toLocaleString("pt-BR")}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
