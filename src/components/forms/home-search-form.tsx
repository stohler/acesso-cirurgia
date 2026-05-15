"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useConsent } from "@/components/consent/consent-provider";
import type { CityCatalog, ProcedureCatalog, SpecialtyCatalog } from "@/lib/types";

type HomeSearchFormProps = {
  specialties: SpecialtyCatalog[];
  procedures: ProcedureCatalog[];
  cities: CityCatalog[];
};

export function HomeSearchForm({ specialties, procedures, cities }: HomeSearchFormProps) {
  const router = useRouter();
  const { hasConsent } = useConsent();

  const [especialidade, setEspecialidade] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [step, setStep] = useState(1);

  const totalSteps = 4;

  const filteredProcedures = useMemo(
    () => procedures.filter((proc) => proc.especialidadeSlug === especialidade),
    [especialidade, procedures],
  );

  const estadosDisponiveis = useMemo(
    () => [...new Set(cities.map((item) => item.uf))].sort((a, b) => a.localeCompare(b)),
    [cities],
  );

  const cidadesDisponiveis = useMemo(
    () => cities.filter((item) => item.uf === estado),
    [cities, estado],
  );

  const canGoNext =
    (step === 1 && !!especialidade) ||
    (step === 2 && !!procedimento) ||
    (step === 3 && !!estado) ||
    (step === 4 && !!cidade);

  return (
    <form
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasConsent) {
          return;
        }

        if (!especialidade || !procedimento || !estado || !cidade) {
          return;
        }

        router.push(`/${especialidade}/${procedimento}/${cidade}`);
      }}
    >
      <h2 className="text-lg font-semibold text-slate-900">Simulador em 4 etapas</h2>
      <p className="text-sm text-slate-600">
        Siga o fluxo para encontrar a faixa estimada do pacote cirúrgico na sua região.
      </p>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                step === item
                  ? "bg-sky-700 text-white"
                  : step > item
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              Etapa {item}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600">
          Etapa atual: <strong>{step}</strong> de <strong>{totalSteps}</strong>
        </p>
      </div>

      {step === 1 ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          1) Especialidade
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
            value={especialidade}
            onChange={(event) => {
              setEspecialidade(event.target.value);
              setProcedimento("");
              setEstado("");
              setCidade("");
            }}
          >
            <option value="">Selecione</option>
            {specialties.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {step === 2 ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          2) Cirurgia/Procedimento
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
            value={procedimento}
            onChange={(event) => {
              setProcedimento(event.target.value);
              setEstado("");
              setCidade("");
            }}
          >
            <option value="">Selecione</option>
            {filteredProcedures.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {step === 3 ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          3) Estado
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
            value={estado}
            onChange={(event) => {
              setEstado(event.target.value);
              setCidade("");
            }}
          >
            <option value="">Selecione</option>
            {estadosDisponiveis.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {step === 4 ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          4) Cidade
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
            value={cidade}
            onChange={(event) => setCidade(event.target.value)}
          >
            <option value="">Selecione</option>
            {cidadesDisponiveis.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.nome} - {item.uf}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Voltar
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(totalSteps, current + 1))}
            disabled={!canGoNext}
            className="rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Continuar
          </button>
        ) : (
          <button
            type="submit"
            className="rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!hasConsent || !canGoNext}
          >
            Ver faixa de valores
          </button>
        )}
      </div>

      {!hasConsent ? (
        <p className="text-xs text-amber-700">Aceite o modal LGPD para habilitar a busca.</p>
      ) : null}
    </form>
  );
}
