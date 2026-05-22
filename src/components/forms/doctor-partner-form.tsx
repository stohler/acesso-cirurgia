"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { ProcedureCatalog, SpecialtyCatalog } from "@/lib/types";

type PricingRow = {
  id: string;
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
  cidadeNome: string;
  uf: string;
  enderecoProcedimento: string;
  valorMedioPacote: string;
};

type DoctorPartnerFormProps = {
  specialties: SpecialtyCatalog[];
  procedures: ProcedureCatalog[];
};

type UfOption = {
  sigla: string;
  nome: string;
};

type CityOption = {
  slug: string;
  nome: string;
};

function newPricingRow(specialtySlug: string): PricingRow {
  return {
    id: crypto.randomUUID(),
    especialidadeSlug: specialtySlug,
    procedimentoSlug: "",
    cidadeSlug: "",
    cidadeNome: "",
    uf: "SP",
    enderecoProcedimento: "",
    valorMedioPacote: "",
  };
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function formatBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function DoctorPartnerForm({ specialties, procedures }: DoctorPartnerFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crm, setCrm] = useState("");
  const [crmUf, setCrmUf] = useState("SP");
  const [rqe, setRqe] = useState("");
  const [miniBio, setMiniBio] = useState("");
  const [selectedProcedureSpecialty, setSelectedProcedureSpecialty] = useState(
    specialties[0]?.slug ?? "cirurgia-geral",
  );
  const [procedureSearchTerm, setProcedureSearchTerm] = useState("");
  const [procedureToAdd, setProcedureToAdd] = useState("");
  const [procedimentosRealizados, setProcedimentosRealizados] = useState<string[]>([]);
  const [pricingRows, setPricingRows] = useState<PricingRow[]>([
    newPricingRow(specialties[0]?.slug ?? "cirurgia-geral"),
  ]);
  const [ufs, setUfs] = useState<UfOption[]>([]);
  const [citiesByUf, setCitiesByUf] = useState<Record<string, CityOption[]>>({});
  const [loadingCitiesByUf, setLoadingCitiesByUf] = useState<Record<string, boolean>>({});
  const [localityMessage, setLocalityMessage] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [certidaoFile, setCertidaoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const proceduresBySpecialty = useMemo(
    () =>
      procedures
        .filter((item) => item.especialidadeSlug === selectedProcedureSpecialty)
        .filter((item) =>
          procedureSearchTerm
            ? item.nome.toLowerCase().includes(procedureSearchTerm.toLowerCase().trim())
            : true,
        ),
    [procedures, procedureSearchTerm, selectedProcedureSpecialty],
  );

  const selectedProceduresDetails = useMemo(
    () =>
      procedimentosRealizados
        .map((slug) => ({
          slug,
          nome: procedures.find((procedure) => procedure.slug === slug)?.nome ?? slug,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [procedimentosRealizados, procedures],
  );

  const loadCitiesByUf = useCallback(async (uf: string) => {
    const normalizedUf = uf.toUpperCase();
    if (!normalizedUf || citiesByUf[normalizedUf]) {
      return;
    }

    setLoadingCitiesByUf((prev) => ({ ...prev, [normalizedUf]: true }));
    setLocalityMessage("");
    try {
      const response = await fetch(`/api/localidades/ufs/${normalizedUf}/cidades`, {
        cache: "force-cache",
      });
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      const payload = (await response.json()) as {
        cidades: Array<{ slug: string; nome: string }>;
      };

      setCitiesByUf((prev) => ({
        ...prev,
        [normalizedUf]: payload.cidades ?? [],
      }));
    } catch {
      setLocalityMessage("Não foi possível carregar cidades agora. Tente novamente em instantes.");
    } finally {
      setLoadingCitiesByUf((prev) => ({ ...prev, [normalizedUf]: false }));
    }
  }, [citiesByUf]);

  useEffect(() => {
    async function loadUfs() {
      try {
        const response = await fetch("/api/localidades/ufs", { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const payload = (await response.json()) as {
          ufs: UfOption[];
        };
        setUfs(payload.ufs ?? []);
      } catch {
        setLocalityMessage("Não foi possível carregar estados no momento.");
      }
    }

    void loadUfs();
  }, []);

  useEffect(() => {
    const uniqueUfs = [...new Set(pricingRows.map((row) => row.uf).filter(Boolean))];
    uniqueUfs.forEach((uf) => {
      void loadCitiesByUf(uf);
    });
  }, [loadCitiesByUf, pricingRows]);

  async function uploadMedicalDocument(file: File, fileKind: "foto" | "certidao") {
    const metaResponse = await fetch("/api/medicos/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalFileName: file.name,
        fileKind,
      }),
    });

    if (!metaResponse.ok) {
      throw new Error("Falha ao obter URL de upload de documento.");
    }

    const meta = (await metaResponse.json()) as {
      signedUrl: string;
      objectPath: string;
    };

    const uploadResponse = await fetch(meta.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: await file.arrayBuffer(),
    });

    if (!uploadResponse.ok) {
      throw new Error("Falha ao enviar documento para armazenamento.");
    }

    return meta.objectPath;
  }

  return (
    <form
      className="card grid gap-4 p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setStatus("Enviando documentos e dados do cadastro...");

        try {
          if (!certidaoFile) {
            throw new Error("Envie a certidão de regularidade do CRM.");
          }

          const [fotoObjectPath, certidaoRegularidadeObjectPath] = await Promise.all([
            fotoFile ? uploadMedicalDocument(fotoFile, "foto") : Promise.resolve<string | undefined>(undefined),
            uploadMedicalDocument(certidaoFile, "certidao"),
          ]);

          const response = await fetch("/api/medicos/cadastro", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nome,
              email,
              telefone,
              crm,
              crmUf,
              rqe: rqe || undefined,
              miniBio: miniBio || undefined,
              fotoObjectPath,
              certidaoRegularidadeObjectPath,
              procedimentosRealizados,
              procedurePricing: pricingRows.map((row) => ({
                especialidadeSlug: row.especialidadeSlug,
                procedimentoSlug: row.procedimentoSlug,
                cidadeSlug: row.cidadeSlug || toSlug(row.cidadeNome),
                cidadeNome: row.cidadeNome,
                uf: row.uf.toUpperCase(),
                enderecoProcedimento: row.enderecoProcedimento,
                valorMedioPacote: Number(row.valorMedioPacote),
              })),
            }),
          });

          if (!response.ok) {
            const payload = (await response.json()) as { error?: string };
            throw new Error(payload.error ?? "Erro ao enviar cadastro.");
          }

          setStatus("Cadastro enviado com sucesso. Nossa equipe fará a avaliação e retorno.");
          setNome("");
          setEmail("");
          setTelefone("");
          setCrm("");
          setRqe("");
          setMiniBio("");
          setProcedureSearchTerm("");
          setProcedureToAdd("");
          setProcedimentosRealizados([]);
          setPricingRows([newPricingRow(specialties[0]?.slug ?? "cirurgia-geral")]);
          setFotoFile(null);
          setCertidaoFile(null);
        } catch (error) {
          setStatus(`Falha no envio: ${String(error)}`);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Solicitar vínculo médico</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          Nome completo
          <input value={nome} onChange={(event) => setNome(event.target.value)} required className="px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          E-mail
          <input
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            className="px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          Telefone
          <input
            value={telefone}
            onChange={(event) => setTelefone(formatBrazilPhone(event.target.value))}
            placeholder="(11) 99999-9999"
            required
            className="px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          CRM
          <input value={crm} onChange={(event) => setCrm(event.target.value)} required className="px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          UF do CRM
          <input value={crmUf} maxLength={2} onChange={(event) => setCrmUf(event.target.value.toUpperCase())} required className="px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          RQE (se aplicável)
          <input value={rqe} onChange={(event) => setRqe(event.target.value)} className="px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
        Mini bio profissional
        <textarea
          value={miniBio}
          onChange={(event) => setMiniBio(event.target.value)}
          className="min-h-24 px-3 py-2"
          placeholder="Descreva experiência, foco cirúrgico e diferenciais da equipe."
        />
      </label>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-[var(--color-text-primary)]">
          Cirurgias realizadas pela equipe
        </legend>
        <div className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
            Especialidade
            <select
              className="px-3 py-2"
              value={selectedProcedureSpecialty}
              onChange={(event) => {
                setSelectedProcedureSpecialty(event.target.value);
                setProcedureToAdd("");
                setProcedureSearchTerm("");
              }}
            >
              {specialties.map((specialty) => (
                <option key={specialty.slug} value={specialty.slug}>
                  {specialty.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-[var(--color-text-primary)]">
              Cirurgia (combobox)
            </label>
            <input
              className="px-3 py-2 text-sm"
              placeholder="Digite para filtrar cirurgia..."
              value={procedureSearchTerm}
              onChange={(event) => setProcedureSearchTerm(event.target.value)}
            />
            <select
              className="px-3 py-2 text-sm"
              value={procedureToAdd}
              onChange={(event) => setProcedureToAdd(event.target.value)}
            >
              <option value="">Selecione uma cirurgia</option>
              {proceduresBySpecialty.map((procedure) => (
                <option key={procedure.slug} value={procedure.slug}>
                  {procedure.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="btn-primary w-full px-3 py-2 text-xs font-semibold md:w-auto"
              onClick={() => {
                if (!procedureToAdd) {
                  return;
                }
                setProcedimentosRealizados((prev) =>
                  prev.includes(procedureToAdd) ? prev : [...prev, procedureToAdd],
                );
                setProcedureToAdd("");
              }}
            >
              Adicionar cirurgia
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {selectedProceduresDetails.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-3 text-xs text-[var(--color-text-secondary)] sm:col-span-2">
              Nenhuma cirurgia adicionada ainda.
            </p>
          ) : null}
          {selectedProceduresDetails.map((procedure) => (
            <div
              key={procedure.slug}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            >
              <span>{procedure.nome}</span>
              <button
                type="button"
                className="text-xs font-semibold text-red-700 hover:underline"
                onClick={() => {
                  setProcedimentosRealizados((prev) =>
                    prev.filter((item) => item !== procedure.slug),
                  );
                }}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <section className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-4">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Endereço e valor médio do pacote por cidade
          </h3>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs font-semibold hover:bg-white"
            onClick={() =>
              setPricingRows((prev) => [
                ...prev,
                newPricingRow(specialties[0]?.slug ?? "cirurgia-geral"),
              ])
            }
          >
            <Plus size={14} />
            Adicionar cidade
          </button>
        </header>

        {pricingRows.map((row) => (
          <div key={row.id} className="grid gap-2 rounded-xl border border-[var(--color-border)] bg-white p-3 md:grid-cols-3">
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
              Especialidade
              <select
                value={row.especialidadeSlug}
                onChange={(event) =>
                  setPricingRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id
                        ? { ...item, especialidadeSlug: event.target.value, procedimentoSlug: "" }
                        : item,
                    ),
                  )
                }
                className="px-2 py-2"
              >
                {specialties.map((specialty) => (
                  <option key={specialty.slug} value={specialty.slug}>
                    {specialty.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
              Procedimento
              <select
                value={row.procedimentoSlug}
                onChange={(event) =>
                  setPricingRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id ? { ...item, procedimentoSlug: event.target.value } : item,
                    ),
                  )
                }
                className="px-2 py-2"
              >
                <option value="">Selecione</option>
                {procedures
                  .filter((procedure) => procedure.especialidadeSlug === row.especialidadeSlug)
                  .map((procedure) => (
                    <option key={procedure.slug} value={procedure.slug}>
                      {procedure.nome}
                    </option>
                  ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
              Valor médio do pacote (R$)
              <input
                value={row.valorMedioPacote}
                type="number"
                min={0}
                onChange={(event) =>
                  setPricingRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id ? { ...item, valorMedioPacote: event.target.value } : item,
                    ),
                  )
                }
                className="px-2 py-2"
                required
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
              UF
              <select
                value={row.uf}
                onChange={(event) =>
                  setPricingRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id
                        ? {
                            ...item,
                            uf: event.target.value.toUpperCase(),
                            cidadeSlug: "",
                            cidadeNome: "",
                          }
                        : item,
                    ),
                  )
                }
                className="px-2 py-2"
                required
              >
                <option value="">Selecione</option>
                {(ufs.length ? ufs.map((item) => item.sigla) : ["SP"]).map((uf) => (
                  <option key={`${row.id}-${uf}`} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
              Cidade
              <select
                value={row.cidadeSlug}
                onChange={(event) => {
                  const selectedCity = (citiesByUf[row.uf] ?? []).find(
                    (city) => city.slug === event.target.value,
                  );
                  setPricingRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id
                        ? {
                            ...item,
                            cidadeSlug: event.target.value,
                            cidadeNome: selectedCity?.nome ?? item.cidadeNome,
                          }
                        : item,
                    ),
                  );
                }}
                className="px-2 py-2"
                required
              >
                <option value="">Selecione</option>
                {(citiesByUf[row.uf] ?? []).map((city) => (
                  <option key={`${row.id}-${city.slug}`} value={city.slug}>
                    {city.nome}
                  </option>
                ))}
              </select>
              {loadingCitiesByUf[row.uf] ? (
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  Carregando cidades...
                </span>
              ) : null}
            </label>
            <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
              Endereço do procedimento
              <input
                value={row.enderecoProcedimento}
                onChange={(event) =>
                  setPricingRows((prev) =>
                    prev.map((item) =>
                      item.id === row.id ? { ...item, enderecoProcedimento: event.target.value } : item,
                    ),
                  )
                }
                className="px-2 py-2"
                required
              />
            </label>
            <div className="md:col-span-3">
              <button
                type="button"
                onClick={() => setPricingRows((prev) => prev.filter((item) => item.id !== row.id))}
                disabled={pricingRows.length === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={12} />
                Remover linha
              </button>
            </div>
          </div>
        ))}
      </section>

      {localityMessage ? (
        <p className="text-xs text-[var(--color-text-secondary)]">{localityMessage}</p>
      ) : null}

      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          Foto profissional
          <input type="file" accept="image/*" onChange={(event) => setFotoFile(event.target.files?.[0] ?? null)} className="px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          Certidão de regularidade do CRM
          <input type="file" accept=".pdf,image/*" onChange={(event) => setCertidaoFile(event.target.files?.[0] ?? null)} className="px-3 py-2" required />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary px-4 py-3 text-sm font-semibold disabled:opacity-60">
        {isSubmitting ? "Enviando cadastro..." : "Enviar cadastro para avaliação"}
      </button>

      {status ? <p className="text-sm text-[var(--color-text-primary)]">{status}</p> : null}
    </form>
  );
}
