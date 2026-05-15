import Link from "next/link";

import { TriageForm } from "@/components/forms/triage-form";
import { getCatalogData } from "@/lib/catalog-service";

export default async function TriagemPage() {
  const catalog = await getCatalogData();

  return (
    <main className="grid gap-6">
      <header className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Triagem avançada e upload de exames</h1>
        <p className="text-sm leading-6 text-slate-700">
          Esta etapa coleta informações clínicas preliminares para encaminhamento ao médico da especialidade e
          região adequada. Dados sensíveis e anexos são criptografados no navegador antes do envio.
        </p>
        <Link href="/" className="text-sm font-semibold text-sky-700 hover:text-sky-900">
          Voltar para busca de preços
        </Link>
      </header>

      <TriageForm specialties={catalog.specialties} procedures={catalog.procedures} cities={catalog.cities} />
    </main>
  );
}
