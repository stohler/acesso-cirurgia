"use client";

import { useEffect, useMemo, useState } from "react";

import { useConsent } from "@/components/consent/consent-provider";
import { encryptTriagePayload } from "@/lib/client-crypto";
import type { CityCatalog, ProcedureCatalog, SpecialtyCatalog } from "@/lib/types";

type TriageFormProps = {
  specialties: SpecialtyCatalog[];
  procedures: ProcedureCatalog[];
  cities: CityCatalog[];
  initialSelection?: {
    especialidade?: string;
    procedimento?: string;
    cidade?: string;
    medicoId?: string;
    medicoNome?: string;
  };
};

export function TriageForm({ specialties, procedures, cities, initialSelection }: TriageFormProps) {
  const { hasConsent, consentVersion } = useConsent();
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [publicKeyLoaded, setPublicKeyLoaded] = useState(false);
  const [publicKeyError, setPublicKeyError] = useState("");

  const [especialidade, setEspecialidade] = useState(
    initialSelection?.especialidade ?? specialties[0]?.slug ?? "cirurgia-geral",
  );
  const [procedimento, setProcedimento] = useState(initialSelection?.procedimento ?? "");
  const [cidade, setCidade] = useState(initialSelection?.cidade ?? "");
  const [selectedDoctorId] = useState(initialSelection?.medicoId ?? "");
  const [selectedDoctorName] = useState(initialSelection?.medicoNome ?? "");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPublicKey() {
      try {
        const response = await fetch("/api/public-config", { cache: "no-store" });
        const payload = (await response.json()) as {
          configured: boolean;
          publicKeyPem?: string;
          error?: string;
        };

        if (!response.ok || !payload.publicKeyPem) {
          setPublicKeyError(payload.error ?? "Falha ao carregar chave pública da triagem.");
          return;
        }

        setPublicKeyPem(payload.publicKeyPem);
      } catch {
        setPublicKeyError("Falha ao carregar chave pública da triagem.");
      } finally {
        setPublicKeyLoaded(true);
      }
    }

    void loadPublicKey();
  }, []);

  const filteredProcedures = useMemo(
    () => procedures.filter((proc) => proc.especialidadeSlug === especialidade),
    [especialidade, procedures],
  );

  const canSubmit =
    hasConsent &&
    !!publicKeyPem &&
    publicKeyLoaded &&
    !!especialidade &&
    !!procedimento &&
    !!cidade &&
    !!nome &&
    !!email &&
    !!telefone &&
    !!sintomas &&
    !!arquivo;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || !arquivo || !publicKeyPem) {
      return;
    }

    setStatus("Criptografando dados sensíveis e anexo no navegador...");
    setIsSubmitting(true);

    try {
      const encrypted = await encryptTriagePayload({
        publicKeyPem,
        sensitiveData: {
          nome,
          email,
          telefone,
          sintomas,
        },
        fileBuffer: await arquivo.arrayBuffer(),
      });

      setStatus("Solicitando URL segura para upload no Google Cloud Storage...");

      const uploadMetaResponse = await fetch("/api/triagens/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalFileName: arquivo.name,
        }),
      });

      if (!uploadMetaResponse.ok) {
        throw new Error("Falha ao obter URL de upload.");
      }

      const uploadMeta = (await uploadMetaResponse.json()) as {
        signedUrl: string;
        objectPath: string;
        uploadMode?: "signed-url" | "proxy";
      };

      setStatus("Enviando anexo criptografado para o bucket seguro...");

      const uploadResponse = await fetch(uploadMeta.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: encrypted.encryptedFileBytes,
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload do anexo criptografado.");
      }

      setStatus("Gravando triagem criptografada na plataforma...");

      const triageResponse = await fetch("/api/triagens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          especialidadeSlug: especialidade,
          procedimentoSlug: procedimento,
          cidadeSlug: cidade,
          doctorReferral:
            selectedDoctorId && selectedDoctorName
              ? {
                  doctorApplicationId: selectedDoctorId,
                  doctorName: selectedDoctorName,
                }
              : undefined,
          consentimentoLgpd: {
            aceito: true,
            versao: consentVersion,
          },
          encryptedPayload: {
            algoritmo: "AES-256-GCM + RSA-OAEP-256",
            iv: encrypted.dataIvBase64,
            encryptedDataBase64: encrypted.encryptedDataBase64,
            encryptedSymmetricKeyBase64: encrypted.encryptedSymmetricKeyBase64,
          },
          attachment: {
            objectPath: uploadMeta.objectPath,
            originalFileName: arquivo.name,
            originalMimeType: arquivo.type || "application/octet-stream",
            encryptedSizeBytes: encrypted.encryptedFileBytes.byteLength,
            encryption: {
              algoritmo: "AES-256-GCM",
              iv: encrypted.fileIvBase64,
            },
          },
        }),
      });

      if (!triageResponse.ok) {
        throw new Error("Não foi possível concluir a triagem.");
      }

      const triageData = (await triageResponse.json()) as { protocolo: string };

      setStatus(`Triagem enviada com sucesso. Protocolo: ${triageData.protocolo}.`);
      setNome("");
      setEmail("");
      setTelefone("");
      setSintomas("");
      setArquivo(null);
      setProcedimento("");
      setCidade("");
    } catch (error) {
      setStatus(`Erro ao enviar triagem: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold text-slate-900">Triagem avançada com upload de exames</h2>
      <p className="text-sm text-slate-600">
        Seus dados pessoais e anexos são criptografados localmente antes do envio.
      </p>

      {selectedDoctorId ? (
        <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          Médico selecionado na busca: <strong>{selectedDoctorName || "Equipe local"}</strong>
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
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
          Procedimento de interesse
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

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nome completo
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Nome do paciente"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          E-mail
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="paciente@email.com"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Telefone/WhatsApp
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
            value={telefone}
            onChange={(event) => setTelefone(event.target.value)}
            placeholder="(15) 99999-9999"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Descrição de sintomas e histórico
        <textarea
          className="min-h-28 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
          value={sintomas}
          onChange={(event) => setSintomas(event.target.value)}
          placeholder="Descreva sintomas, tempo de evolução e exames prévios."
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Upload de exame (PDF, imagem ou laudo)
        <input
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
          type="file"
          onChange={(event) => setArquivo(event.target.files?.[0] ?? null)}
        />
      </label>

      {!publicKeyPem && publicKeyLoaded ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          {publicKeyError ||
            "Chave pública de criptografia não configurada no runtime. Configure TRIAGE_RSA_PUBLIC_KEY_PEM (ou NEXT_PUBLIC_TRIAGE_RSA_PUBLIC_KEY_PEM)."}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? "Enviando triagem..." : "Enviar triagem criptografada"}
      </button>

      {!hasConsent ? (
        <p className="text-xs text-amber-700">Aceite o consentimento LGPD para habilitar o envio.</p>
      ) : null}

      {status ? <p className="text-sm text-slate-700">{status}</p> : null}
    </form>
  );
}
