"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { ProcedureCatalog, SpecialtyCatalog } from "@/lib/types";

type AddressProcedureFormRow = {
  id: string;
  especialidadeSlug: string;
  procedimentoSlug: string;
  valorMedioPacote: string;
};

type PracticeAddressFormRow = {
  id: string;
  uf: string;
  cidadeSlug: string;
  cidadeNome: string;
  enderecoProcedimento: string;
  selectedSpecialtySlug: string;
  procedureComboboxValue: string;
  procedures: AddressProcedureFormRow[];
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

function slugToLabel(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function newPracticeAddress(defaultSpecialtySlug: string): PracticeAddressFormRow {
  return {
    id: crypto.randomUUID(),
    uf: "SP",
    cidadeSlug: "",
    cidadeNome: "",
    enderecoProcedimento: "",
    selectedSpecialtySlug: defaultSpecialtySlug,
    procedureComboboxValue: "",
    procedures: [],
  };
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
  const defaultSpecialtySlug = specialties[0]?.slug ?? "cirurgia-geral";
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crm, setCrm] = useState("");
  const [crmUf, setCrmUf] = useState("SP");
  const [rqe, setRqe] = useState("");
  const [miniBio, setMiniBio] = useState("");
  const [practiceAddresses, setPracticeAddresses] = useState<PracticeAddressFormRow[]>([
    newPracticeAddress(defaultSpecialtySlug),
  ]);
  const [ufs, setUfs] = useState<UfOption[]>([]);
  const [citiesByUf, setCitiesByUf] = useState<Record<string, CityOption[]>>({});
  const [loadingCitiesByUf, setLoadingCitiesByUf] = useState<Record<string, boolean>>({});
  const [localityMessage, setLocalityMessage] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [certidaoFile, setCertidaoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const procedureNameBySlug = useMemo(
    () => new Map(procedures.map((item) => [item.slug, item.nome])),
    [procedures],
  );
  const specialtyNameBySlug = useMemo(
    () => new Map(specialties.map((item) => [item.slug, item.nome])),
    [specialties],
  );

  const flattenedProcedurePricing = useMemo(
    () =>
      practiceAddresses.flatMap((address) =>
        address.procedures.map((procedure) => ({
          especialidadeSlug: procedure.especialidadeSlug,
          procedimentoSlug: procedure.procedimentoSlug,
          cidadeSlug: address.cidadeSlug,
          cidadeNome: address.cidadeNome,
          uf: address.uf.toUpperCase(),
          enderecoProcedimento: address.enderecoProcedimento,
          valorMedioPacote: Number(procedure.valorMedioPacote),
        })),
      ),
    [practiceAddresses],
  );

  function updateAddress(addressId: string, updater: (address: PracticeAddressFormRow) => PracticeAddressFormRow) {
    setPracticeAddresses((prev) =>
      prev.map((address) => (address.id === addressId ? updater(address) : address)),
    );
  }

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
    const uniqueUfs = [...new Set(practiceAddresses.map((row) => row.uf).filter(Boolean))];
    uniqueUfs.forEach((uf) => {
      void loadCitiesByUf(uf);
    });
  }, [loadCitiesByUf, practiceAddresses]);

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
          if (practiceAddresses.length === 0) {
            throw new Error("Adicione ao menos um endereço de atendimento.");
          }

          const hasInvalidAddress = practiceAddresses.some(
            (address) =>
              !address.uf ||
              !address.cidadeSlug ||
              !address.cidadeNome ||
              !address.enderecoProcedimento.trim() ||
              address.procedures.length === 0,
          );
          if (hasInvalidAddress) {
            throw new Error("Preencha UF, cidade, endereço e ao menos um procedimento em cada endereço.");
          }

          const hasInvalidPrice = practiceAddresses.some((address) =>
            address.procedures.some(
              (procedure) =>
                !procedure.especialidadeSlug ||
                !procedure.procedimentoSlug ||
                Number(procedure.valorMedioPacote) <= 0,
            ),
          );
          if (hasInvalidPrice) {
            throw new Error("Informe o valor médio (R$) de todos os procedimentos.");
          }

          const [fotoObjectPath, certidaoRegularidadeObjectPath] = await Promise.all([
            fotoFile ? uploadMedicalDocument(fotoFile, "foto") : Promise.resolve<string | undefined>(undefined),
            uploadMedicalDocument(certidaoFile, "certidao"),
          ]);

          const procedimentosRealizados = [
            ...new Set(flattenedProcedurePricing.map((item) => item.procedimentoSlug)),
          ];

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
              practiceAddresses: practiceAddresses.map((address) => ({
                uf: address.uf.toUpperCase(),
                cidadeSlug: address.cidadeSlug,
                cidadeNome: address.cidadeNome,
                enderecoProcedimento: address.enderecoProcedimento,
                procedures: address.procedures.map((procedure) => ({
                  especialidadeSlug: procedure.especialidadeSlug,
                  procedimentoSlug: procedure.procedimentoSlug,
                  valorMedioPacote: Number(procedure.valorMedioPacote),
                })),
              })),
              // Compatibilidade com rotinas já existentes de descoberta/aprovação.
              procedurePricing: flattenedProcedurePricing,
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
          setCrmUf("SP");
          setRqe("");
          setMiniBio("");
          setPracticeAddresses([newPracticeAddress(defaultSpecialtySlug)]);
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

      <section className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-4">
        <header className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Endereços e procedimentos com valor médio por local
          </h3>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs font-semibold hover:bg-white"
            onClick={() =>
              setPracticeAddresses((prev) => [
                ...prev,
                newPracticeAddress(defaultSpecialtySlug),
              ])
            }
          >
            <Plus size={14} />
            Adicionar endereço
          </button>
        </header>

        {practiceAddresses.map((address, addressIndex) => {
          const procedureOptions = procedures
            .filter((procedure) => procedure.especialidadeSlug === address.selectedSpecialtySlug)
            .sort((a, b) => a.nome.localeCompare(b.nome));
          const comboboxNormalized = address.procedureComboboxValue.trim().toLowerCase();
          const matchedProcedure = procedureOptions.find(
            (procedure) =>
              procedure.nome.toLowerCase() === comboboxNormalized || procedure.slug.toLowerCase() === comboboxNormalized,
          );

          return (
            <div key={address.id} className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Endereço {addressIndex + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => setPracticeAddresses((prev) => prev.filter((item) => item.id !== address.id))}
                  disabled={practiceAddresses.length === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Remover endereço
                </button>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
                  UF
                  <select
                    value={address.uf}
                    onChange={(event) => {
                      const nextUf = event.target.value.toUpperCase();
                      updateAddress(address.id, (current) => ({
                        ...current,
                        uf: nextUf,
                        cidadeSlug: "",
                        cidadeNome: "",
                      }));
                    }}
                    className="px-2 py-2"
                    required
                  >
                    <option value="">Selecione</option>
                    {(ufs.length ? ufs.map((item) => item.sigla) : ["SP"]).map((uf) => (
                      <option key={`${address.id}-${uf}`} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
                  Cidade
                  <select
                    value={address.cidadeSlug}
                    onChange={(event) => {
                      const selectedCity = (citiesByUf[address.uf] ?? []).find(
                        (city) => city.slug === event.target.value,
                      );
                      updateAddress(address.id, (current) => ({
                        ...current,
                        cidadeSlug: event.target.value,
                        cidadeNome: selectedCity?.nome ?? current.cidadeNome,
                      }));
                    }}
                    className="px-2 py-2"
                    required
                  >
                    <option value="">Selecione</option>
                    {(citiesByUf[address.uf] ?? []).map((city) => (
                      <option key={`${address.id}-${city.slug}`} value={city.slug}>
                        {city.nome}
                      </option>
                    ))}
                  </select>
                  {loadingCitiesByUf[address.uf] ? (
                    <span className="text-[10px] text-[var(--color-text-secondary)]">
                      Carregando cidades...
                    </span>
                  ) : null}
                </label>

                <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
                  Endereço do procedimento
                  <input
                    value={address.enderecoProcedimento}
                    onChange={(event) =>
                      updateAddress(address.id, (current) => ({
                        ...current,
                        enderecoProcedimento: event.target.value,
                      }))
                    }
                    className="px-2 py-2"
                    placeholder="Hospital/Clínica, rua, número"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-3 md:grid-cols-[1fr_1fr_auto]">
                <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
                  Especialidade
                  <select
                    value={address.selectedSpecialtySlug}
                    onChange={(event) =>
                      updateAddress(address.id, (current) => ({
                        ...current,
                        selectedSpecialtySlug: event.target.value,
                        procedureComboboxValue: "",
                      }))
                    }
                    className="px-2 py-2"
                  >
                    {specialties.map((specialty) => (
                      <option key={`${address.id}-${specialty.slug}`} value={specialty.slug}>
                        {specialty.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[var(--color-text-primary)]">
                    Procedimento
                  </label>
                  <input
                    className="px-2 py-2 text-sm"
                    list={`procedure-options-${address.id}`}
                    placeholder="Digite ou selecione o procedimento"
                    value={address.procedureComboboxValue}
                    onChange={(event) =>
                      updateAddress(address.id, (current) => ({
                        ...current,
                        procedureComboboxValue: event.target.value,
                      }))
                    }
                  />
                  <datalist id={`procedure-options-${address.id}`}>
                    {procedureOptions.map((procedure) => (
                      <option key={`${address.id}-procedure-${procedure.slug}`} value={procedure.nome} />
                    ))}
                  </datalist>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    Se preferir, você também pode digitar o slug técnico do procedimento.
                  </span>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    className="btn-primary w-full px-3 py-2 text-xs font-semibold md:w-auto"
                    onClick={() => {
                      if (!matchedProcedure) {
                        setStatus("Selecione um procedimento válido no combobox antes de adicionar.");
                        return;
                      }

                      updateAddress(address.id, (current) => {
                        if (current.procedures.some((procedure) => procedure.procedimentoSlug === matchedProcedure.slug)) {
                          return {
                            ...current,
                            procedureComboboxValue: "",
                          };
                        }

                        return {
                          ...current,
                          procedures: [
                            ...current.procedures,
                            {
                              id: crypto.randomUUID(),
                              especialidadeSlug: current.selectedSpecialtySlug,
                              procedimentoSlug: matchedProcedure.slug,
                              valorMedioPacote: "",
                            },
                          ],
                          procedureComboboxValue: "",
                        };
                      });
                    }}
                  >
                    Adicionar procedimento
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                {address.procedures.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-3 text-xs text-[var(--color-text-secondary)]">
                    Este endereço ainda não possui procedimentos.
                  </p>
                ) : null}

                {address.procedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className="grid gap-2 rounded-lg border border-[var(--color-border)] bg-white p-2 md:grid-cols-[1fr_220px_auto]"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {specialtyNameBySlug.get(procedure.especialidadeSlug) ?? slugToLabel(procedure.especialidadeSlug)}{" "}
                        /{" "}
                        {procedureNameBySlug.get(procedure.procedimentoSlug) ?? slugToLabel(procedure.procedimentoSlug)}
                      </p>
                    </div>
                    <label className="grid gap-1 text-xs font-medium text-[var(--color-text-primary)]">
                      Valor médio (R$)
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={procedure.valorMedioPacote}
                        onChange={(event) =>
                          updateAddress(address.id, (current) => ({
                            ...current,
                            procedures: current.procedures.map((itemProcedure) =>
                              itemProcedure.id === procedure.id
                                ? { ...itemProcedure, valorMedioPacote: event.target.value }
                                : itemProcedure,
                            ),
                          }))
                        }
                        className="px-2 py-2"
                        required
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={() =>
                          updateAddress(address.id, (current) => ({
                            ...current,
                            procedures: current.procedures.filter((itemProcedure) => itemProcedure.id !== procedure.id),
                          }))
                        }
                      >
                        <Trash2 size={12} />
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {localityMessage ? (
        <p className="text-xs text-[var(--color-text-secondary)]">{localityMessage}</p>
      ) : null}

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Resumo de procedimentos cadastrados</h3>
        {flattenedProcedurePricing.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Nenhum procedimento vinculado ainda.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {[...new Set(flattenedProcedurePricing.map((item) => item.procedimentoSlug))].map((slug) => (
              <span
                key={`summary-${slug}`}
                className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-2 py-1 text-xs text-[var(--color-text-primary)]"
              >
                {procedureNameBySlug.get(slug) ?? slugToLabel(slug)}
              </span>
            ))}
          </div>
        )}
      </section>

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
