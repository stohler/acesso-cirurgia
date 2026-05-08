import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PriceDisclaimer } from "@/components/seo/price-disclaimer";
import { findPriceEstimate, getCatalogData } from "@/lib/catalog-service";
import { formatCurrency } from "@/lib/utils";

type RouteProps = {
  params: Promise<{
    especialidade: string;
    procedimento: string;
    cidade: string;
  }>;
};

async function loadPageData({ especialidade, procedimento, cidade }: { especialidade: string; procedimento: string; cidade: string }) {
  const [catalog, estimate] = await Promise.all([
    getCatalogData(),
    findPriceEstimate(especialidade, procedimento, cidade),
  ]);

  const specialty = catalog.specialties.find((item) => item.slug === especialidade);
  const procedure = catalog.procedures.find((item) => item.slug === procedimento);
  const city = catalog.cities.find((item) => item.slug === cidade);

  return { specialty, procedure, city, estimate };
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const resolved = await params;
  const data = await loadPageData(resolved);

  if (!data.estimate || !data.specialty || !data.procedure || !data.city) {
    return {
      title: "Preço estimado não encontrado | AgendeSuaCirurgia.com.br",
    };
  }

  const min = formatCurrency(data.estimate.precoMinimo);
  const max = formatCurrency(data.estimate.precoMaximo);

  return {
    title: `${data.procedure.nome} em ${data.city.nome} (${data.city.uf}) | ${min} a ${max}`,
    description: `Veja a faixa estimada de ${data.procedure.nome} em ${data.city.nome}/${data.city.uf} na especialidade ${data.specialty.nome}.`,
    alternates: {
      canonical: `/${resolved.especialidade}/${resolved.procedimento}/${resolved.cidade}`,
    },
  };
}

export default async function PriceByLocationPage({ params }: RouteProps) {
  const resolved = await params;
  const data = await loadPageData(resolved);

  if (!data.estimate || !data.specialty || !data.procedure || !data.city) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "AgendeSuaCirurgia.com.br",
    medicalSpecialty: data.specialty.nome,
    areaServed: `${data.city.nome} - ${data.city.uf}`,
    offers: {
      "@type": "Offer",
      itemOffered: data.procedure.nome,
      priceCurrency: "BRL",
      lowPrice: data.estimate.precoMinimo,
      highPrice: data.estimate.precoMaximo,
    },
  };

  return (
    <main className="grid gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Rota SEO local</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {data.procedure.nome} em {data.city.nome} - {data.city.uf}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Especialidade: <strong>{data.specialty.nome}</strong>
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Faixa estimada do pacote padrão</h2>
        <p className="mt-2 text-sm text-slate-600">{data.estimate.pacote}</p>
        <p className="mt-3 text-3xl font-extrabold text-slate-900">
          {formatCurrency(data.estimate.precoMinimo)} a {formatCurrency(data.estimate.precoMaximo)}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Base de referência atualizada em {new Date(data.estimate.atualizadoEm).toLocaleDateString("pt-BR")}
        </p>

        <div className="mt-4">
          <PriceDisclaimer />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/triagem" className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800">
            Iniciar triagem para este procedimento
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Nova busca
          </Link>
        </div>
      </section>
    </main>
  );
}
