"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { CONSENT_COOKIE_NAME, CONSENT_COOKIE_VALUE, CONSENT_VERSION } from "@/lib/consent";

type ConsentContextValue = {
  hasConsent: boolean;
  consentVersion: string;
  acceptConsent: () => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

type ConsentProviderProps = {
  children: React.ReactNode;
  initialHasConsent?: boolean;
};

export function ConsentProvider({ children, initialHasConsent = false }: ConsentProviderProps) {
  const [hasConsent, setHasConsent] = useState(initialHasConsent);

  const value = useMemo(
    () => ({
      hasConsent,
      consentVersion: CONSENT_VERSION,
      acceptConsent: () => {
        document.cookie = `${CONSENT_COOKIE_NAME}=${CONSENT_COOKIE_VALUE}; path=/; max-age=31536000; samesite=lax`;
        setHasConsent(true);
      },
    }),
    [hasConsent],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {!hasConsent ? <ConsentBar onAccept={value.acceptConsent} /> : null}
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

function ConsentBar({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl gap-3 px-4 py-4 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Consentimento LGPD obrigatório</h2>
          <p className="mt-1 text-xs leading-5 text-slate-700 sm:text-sm">
          Para avançar com simulações, triagens e envio de exames, precisamos do seu consentimento explícito
            para tratamento de dados pessoais e sensíveis, conforme a LGPD. Seus dados clínicos e anexos são
            protegidos com criptografia.
          </p>
        </div>
        <button
          type="button"
          onClick={onAccept}
          className="w-full rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 md:w-auto"
        >
          Aceitar e continuar
        </button>
      </div>
    </div>
  );
}
