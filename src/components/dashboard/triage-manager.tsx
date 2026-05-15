"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { decryptAttachment, decryptSensitivePayload } from "@/lib/client-crypto";

type TriageRow = {
  id: string;
  especialidadeSlug: string;
  procedimentoSlug: string;
  cidadeSlug: string;
  status: string;
  createdAt: string;
  encryptedPayload: {
    iv: string;
    encryptedDataBase64: string;
    encryptedSymmetricKeyBase64: string;
  };
  attachment: {
    objectPath: string;
    originalFileName: string;
    originalMimeType: string;
    encryption: {
      iv: string;
    };
  };
};

type TriageManagerProps = {
  doctorName: string;
  triagens: TriageRow[];
};

export function TriageManager({ doctorName, triagens }: TriageManagerProps) {
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string>(triagens[0]?.id ?? "");
  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [decryptedData, setDecryptedData] = useState<Record<string, string> | null>(null);
  const [decryptionStatus, setDecryptionStatus] = useState("");

  const selectedTriage = useMemo(
    () => triagens.find((item) => item.id === selectedId) ?? null,
    [selectedId, triagens],
  );

  async function handleDecryptData() {
    if (!selectedTriage || !privateKeyPem) {
      return;
    }

    setDecryptionStatus("Descriptografando dados sensíveis localmente...");

    try {
      const data = await decryptSensitivePayload({
        privateKeyPem,
        encryptedDataBase64: selectedTriage.encryptedPayload.encryptedDataBase64,
        encryptedSymmetricKeyBase64: selectedTriage.encryptedPayload.encryptedSymmetricKeyBase64,
        ivBase64: selectedTriage.encryptedPayload.iv,
      });

      setDecryptedData(data);
      setDecryptionStatus("Dados descriptografados no navegador com sucesso.");
    } catch (error) {
      setDecryptionStatus(`Falha ao descriptografar dados: ${String(error)}`);
    }
  }

  async function handleDecryptAttachment() {
    if (!selectedTriage || !privateKeyPem) {
      return;
    }

    setDecryptionStatus("Baixando anexo criptografado e descriptografando localmente...");

    try {
      const metadataResponse = await fetch(`/api/triagens/${selectedTriage.id}/download-url`);
      if (!metadataResponse.ok) {
        throw new Error("Falha ao obter URL de download do anexo.");
      }

      const metadata = (await metadataResponse.json()) as {
        signedUrl: string;
        originalFileName: string;
        originalMimeType: string;
        encryptionIv: string;
        encryptedSymmetricKeyBase64: string;
      };

      const encryptedFileResponse = await fetch(metadata.signedUrl);
      if (!encryptedFileResponse.ok) {
        throw new Error("Falha ao baixar anexo criptografado.");
      }

      const decryptedArrayBuffer = await decryptAttachment({
        privateKeyPem,
        encryptedSymmetricKeyBase64: metadata.encryptedSymmetricKeyBase64,
        fileIvBase64: metadata.encryptionIv,
        encryptedFileBuffer: await encryptedFileResponse.arrayBuffer(),
      });

      const blob = new Blob([decryptedArrayBuffer], { type: metadata.originalMimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `descriptografado-${metadata.originalFileName}`;
      anchor.click();
      URL.revokeObjectURL(url);

      setDecryptionStatus("Anexo descriptografado e baixado localmente.");
    } catch (error) {
      setDecryptionStatus(`Falha ao descriptografar anexo: ${String(error)}`);
    }
  }

  return (
    <section className="grid gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Médico autenticado</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Olá, Dr(a). {doctorName}</h1>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/dashboard/login");
              router.refresh();
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Triagens recebidas</h2>
          <p className="mb-4 text-sm text-slate-600">
            Gestão por especialidade/região com dados sensíveis visíveis apenas após descriptografia local.
          </p>

          <div className="grid gap-3">
            {triagens.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">Nenhuma triagem encontrada.</p>
            ) : null}

            {triagens.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setDecryptedData(null);
                }}
                className={`rounded-xl border p-3 text-left transition ${
                  selectedId === item.id
                    ? "border-sky-400 bg-sky-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">
                  {item.especialidadeSlug} / {item.procedimentoSlug}
                </p>
                <p className="text-xs text-slate-600">
                  Cidade: {item.cidadeSlug} • Status: {item.status}
                </p>
                <p className="text-xs text-slate-500">
                  Recebida em {new Date(item.createdAt).toLocaleString("pt-BR")}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Descriptografia ponta a ponta</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            A chave privada nunca é enviada ao servidor. Todo processo acontece no navegador.
          </p>

          <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
            Chave privada RSA (PEM)
            <textarea
              className="min-h-32 rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-sky-600"
              placeholder="-----BEGIN PRIVATE KEY-----"
              value={privateKeyPem}
              onChange={(event) => setPrivateKeyPem(event.target.value)}
            />
          </label>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              onClick={handleDecryptData}
              disabled={!selectedTriage}
            >
              Descriptografar dados
            </button>
            <button
              type="button"
              className="rounded-xl bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              onClick={handleDecryptAttachment}
              disabled={!selectedTriage}
            >
              Descriptografar anexo
            </button>
          </div>

          {decryptionStatus ? <p className="mt-3 text-xs text-slate-700">{decryptionStatus}</p> : null}

          {decryptedData ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <h3 className="font-semibold">Dados sensíveis descriptografados</h3>
              <ul className="mt-2 space-y-1">
                {Object.entries(decryptedData).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
