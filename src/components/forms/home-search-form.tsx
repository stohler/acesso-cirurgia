"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CircleDot,
  HandCoins,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { useConsent } from "@/components/consent/consent-provider";
import type { CityCatalog, ProcedureCatalog, SpecialtyCatalog } from "@/lib/types";

type HomeSearchFormProps = {
  specialties: SpecialtyCatalog[];
  procedures: ProcedureCatalog[];
  cities: CityCatalog[];
};

type UfOption = {
  sigla: string;
  nome: string;
};

type CityOption = {
  slug: string;
  nome: string;
  uf: string;
};

const procedureVisualMap: Record<string, { icon: LucideIcon; label: string }> = {
  vesicula: {
    icon: Stethoscope,
    label: "Vesícula",
  },
  "hernia-inguinal": {
    icon: ShieldCheck,
    label: "Hérnia inguinal",
  },
  hemorroida: {
    icon: CircleDot,
    label: "Hemorroida",
  },
};

export function HomeSearchForm({ specialties, procedures, cities }: HomeSearchFormProps) {
  const router = useRouter();
  const { hasConsent } = useConsent();

  const [ufs, setUfs] = useState<UfOption[]>([]);
  const [cidadesDoEstado, setCidadesDoEstado] = useState<CityOption[]>([]);
  const [loadingUfs, setLoadingUfs] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [localidadesError, setLocalidadesError] = useState("");

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

  const fallbackEstados = useMemo(
    () => [...new Set(cities.map((item) => item.uf))].sort((a, b) => a.localeCompare(b)),
    [cities],
  );

  const fallbackCidadesDoEstado = useMemo(
    () => cities.filter((item) => item.uf === estado),
    [cities, estado],
  );

  const estadosDisponiveis = ufs.length ? ufs.map((item) => item.sigla) : fallbackEstados;
  const cidadesDisponiveis = cidadesDoEstado.length
    ? cidadesDoEstado
    : fallbackCidadesDoEstado.map((item) => ({
        slug: item.slug,
        nome: item.nome,
        uf: item.uf,
      }));
  const cidadeSelecionada = cidadesDisponiveis.find((item) => item.slug === cidade);

  const canGoNext =
    (step === 1 && !!especialidade) ||
    (step === 2 && !!procedimento) ||
    (step === 3 && !!estado) ||
    (step === 4 && !!cidade);
  const progress = Math.round((step / totalSteps) * 100);

  useEffect(() => {
    async function loadUfs() {
      setLoadingUfs(true);
      setLocalidadesError("");
      try {
        const response = await fetch("/api/localidades/ufs", {
          cache: "force-cache",
        });

        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const payload = (await response.json()) as { ufs: UfOption[] };
        setUfs(payload.ufs ?? []);
      } catch {
        setLocalidadesError("Não foi possível carregar todos os estados agora. Exibindo opções locais.");
      } finally {
        setLoadingUfs(false);
      }
    }

    void loadUfs();
  }, []);

  useEffect(() => {
    if (!estado) {
      return;
    }

    async function loadCitiesByState() {
      setLoadingCidades(true);
      setLocalidadesError("");
      try {
        const response = await fetch(`/api/localidades/ufs/${estado}/cidades`, {
          cache: "force-cache",
        });
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const payload = (await response.json()) as {
          uf: string;
          cidades: Array<{ slug: string; nome: string }>;
        };
        setCidadesDoEstado(
          (payload.cidades ?? []).map((item) => ({
            slug: item.slug,
            nome: item.nome,
            uf: payload.uf ?? estado,
          })),
        );
      } catch {
        setLocalidadesError("Não foi possível carregar cidades no momento. Exibindo base local.");
        setCidadesDoEstado([]);
      } finally {
        setLoadingCidades(false);
      }
    }

    void loadCitiesByState();
  }, [estado]);

  return (
    <form
      className="card mx-auto grid w-full max-w-2xl gap-5 p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasConsent) {
          return;
        }

        if (!especialidade || !procedimento || !estado || !cidade) {
          return;
        }

        const cidadeNomeQuery = cidadeSelecionada?.nome ?? cidade;
        router.push(
          `/${especialidade}/${procedimento}/${cidade}?uf=${encodeURIComponent(
            estado,
          )}&cidadeNome=${encodeURIComponent(cidadeNomeQuery)}`,
        );
      }}
    >
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Simulador em 4 etapas</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Siga o fluxo para encontrar a faixa estimada do pacote cirúrgico na sua região.
      </p>

      <div className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Passo {step} de 4</p>
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{progress}% concluído</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[var(--color-primary-green)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Etapa atual: <strong>{step}</strong> de <strong>{totalSteps}</strong>. O processo é rápido e guiado.
        </p>
      </div>

      <div className="animate-step-in transition-all duration-300">
        {step === 1 ? (
          <label className="grid gap-2 text-sm font-medium text-[var(--color-text-primary)]">
            1) Escolha a especialidade
            <select
              className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 outline-none focus:border-[var(--color-primary-blue-light)]"
              value={especialidade}
              onChange={(event) => {
                setEspecialidade(event.target.value);
                setProcedimento("");
                setEstado("");
                setCidade("");
                setCidadesDoEstado([]);
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
          <div className="grid gap-3">
            <label className="grid gap-2 text-sm font-medium text-[var(--color-text-primary)]">
              2) Escolha a cirurgia/procedimento
              <select
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 outline-none focus:border-[var(--color-primary-blue-light)]"
                value={procedimento}
                onChange={(event) => {
                  setProcedimento(event.target.value);
                  setEstado("");
                  setCidade("");
                  setCidadesDoEstado([]);
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

            <div className="grid gap-2 sm:grid-cols-2">
              {filteredProcedures.map((item) => {
                const visual = procedureVisualMap[item.slug];
                const Icon = visual?.icon ?? HandCoins;

                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => {
                      setProcedimento(item.slug);
                      setEstado("");
                      setCidade("");
                      setCidadesDoEstado([]);
                    }}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      procedimento === item.slug
                        ? "border-[var(--color-primary-green)] bg-[#00B7A81A]"
                        : "border-[var(--color-border)] bg-white hover:bg-[var(--color-background-soft)]"
                    }`}
                  >
                    <span className="rounded-lg bg-[var(--color-primary-green-light)]/30 p-2 text-[var(--color-primary-blue)]">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {visual?.label ?? item.nome}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <label className="grid gap-2 text-sm font-medium text-[var(--color-text-primary)]">
            3) Escolha o estado
            <select
              className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 outline-none focus:border-[var(--color-primary-blue-light)]"
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
            {loadingUfs ? (
              <span className="text-xs text-[var(--color-text-secondary)]">Carregando estados do Brasil...</span>
            ) : null}
          </label>
        ) : null}

        {step === 4 ? (
          <label className="grid gap-2 text-sm font-medium text-[var(--color-text-primary)]">
            4) Escolha a cidade
            <select
              className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 outline-none focus:border-[var(--color-primary-blue-light)]"
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
            {loadingCidades ? (
              <span className="text-xs text-[var(--color-text-secondary)]">Carregando cidades do estado...</span>
            ) : null}
          </label>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-soft)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(totalSteps, current + 1))}
            disabled={!canGoNext}
            className="btn-primary flex min-h-12 w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
          >
            Continuar
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary col-span-2 min-h-12 w-full px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:col-auto sm:w-auto"
            disabled={!hasConsent || !canGoNext}
          >
            Ver valor social estimado
          </button>
        )}
      </div>

      {!hasConsent ? (
        <p className="text-xs text-[var(--color-warning)]">Aceite o modal LGPD para habilitar a busca.</p>
      ) : null}
      {localidadesError ? <p className="text-xs text-[var(--color-text-secondary)]">{localidadesError}</p> : null}
    </form>
  );
}
