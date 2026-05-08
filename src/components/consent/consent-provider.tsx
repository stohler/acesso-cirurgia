"use client";

import { createContext, useContext, useMemo, useState } from "react";

const CONSENT_VERSION = "1.0";
const CONSENT_STORAGE_KEY = "asc-lgpd-consent";

type ConsentContextValue = {
  hasConsent: boolean;
  consentVersion: string;
  acceptConsent: () => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [hasConsent, setHasConsent] = useState(false);

  const value = useMemo(
    () => ({
      hasConsent,
      consentVersion: CONSENT_VERSION,
      acceptConsent: () => {
        localStorage.setItem(
          CONSENT_STORAGE_KEY,
          JSON.stringify({
            accepted: true,
            acceptedAt: new Date().toISOString(),
            version: CONSENT_VERSION,
          }),
        );
        setHasConsent(true);
      },
    }),
    [hasConsent],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {!hasConsent ? <ConsentModal onAccept={value.acceptConsent} /> : null}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent deve ser usado dentro de ConsentProvider");
  }

  return context;
}

function ConsentModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-900">Consentimento LGPD obrigatório</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Para avançar com simulações, triagens e envio de exames, precisamos do seu consentimento explícito
          para tratamento de dados pessoais e sensíveis, conforme a Lei Geral de Proteção de Dados (LGPD).
          Os anexos e dados clínicos são enviados de forma criptografada ponta a ponta.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Finalidade: análise de elegibilidade cirúrgica e contato assistencial.</li>
          <li>Base legal: consentimento do titular e proteção da saúde.</li>
          <li>Revogação: você pode solicitar exclusão e revogação a qualquer momento.</li>
        </ul>
        <button
          type="button"
          onClick={onAccept}
          className="mt-6 w-full rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
        >
          Aceito o tratamento de dados e desejo continuar
        </button>
      </div>
    </div>
  );
}
