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

  const [especialidade, setEspecialidade] = useState(specialties[0]?.slug ?? "cirurgia-geral");
  const [procedimento, setProcedimento] = useState("");
  const [cidade, setCidade] = useState("");

  const filteredProcedures = useMemo(
    () => procedures.filter((proc) => proc.especialidadeSlug === especialidade),
    [especialidade, procedures],
  );

  return (
    <form
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasConsent) {
          return;
        }

        if (!especialidade || !procedimento || !cidade) {
          return;
        }

        router.push(`/${especialidade}/${procedimento}/${cidade}`);
      }}
    >
      <h2 className="text-lg font-semibold text-slate-900">Encontre valores estimados por cidade</h2>
      <p className="text-sm text-slate-600">
        Filtre por especialidade, procedimento e cidade do interior para ver faixa de preço estimada.
      </p>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Especialidade
        <select
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
          value={especialidade}
          onChange={(event) => {
            setEspecialidade(event.target.value);
            setProcedimento("");
          }}
        >
          {specialties.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Procedimento
        <select
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
          value={procedimento}
          onChange={(event) => setProcedimento(event.target.value)}
        >
          <option value="">Selecione</option>
          {filteredProcedures.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Cidade
        <select
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
          value={cidade}
          onChange={(event) => setCidade(event.target.value)}
        >
          <option value="">Selecione</option>
          {cities.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.nome} - {item.uf}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!hasConsent}
      >
        Buscar faixa de valores
      </button>

      {!hasConsent ? (
        <p className="text-xs text-amber-700">Aceite o modal LGPD para habilitar a busca.</p>
      ) : null}
    </form>
  );
}
