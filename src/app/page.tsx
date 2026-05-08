import Link from "next/link";

import { HomeSearchForm } from "@/components/forms/home-search-form";
import { PriceDisclaimer } from "@/components/seo/price-disclaimer";
import { DEFAULT_PRICE_ESTIMATES } from "@/lib/constants";
import { getCatalogData } from "@/lib/catalog-service";
import { formatCurrency } from "@/lib/utils";

export default async function Home() {
  const catalog = await getCatalogData();

  return (
    <main className="grid gap-8">
      <section className="grid gap-4 rounded-3xl bg-gradient-to-br from-sky-950 to-sky-700 px-6 py-8 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">AgendeSuaCirurgia.com.br</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
          Busque cirurgia por cidade do interior, compare faixas de preço e envie sua triagem com proteção LGPD.
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-sky-100 sm:text-base">
          Estrutura pronta para crescer de Cirurgia Geral para outras especialidades (Oftalmo, Vascular e mais)
          mantendo rotas SEO locais no formato /especialidade/procedimento/cidade.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/triagem" className="rounded-xl bg-white px-4 py-2 font-semibold text-sky-900 hover:bg-sky-50">
            Iniciar triagem avançada
          </Link>
          <Link
            href="/dashboard/login"
            className="rounded-xl border border-sky-200 px-4 py-2 font-semibold text-sky-100 hover:bg-sky-800"
          >
            Acesso médico
          </Link>
        </div>
      </section>

      <HomeSearchForm
        specialties={catalog.specialties}
        procedures={catalog.procedures}
        cities={catalog.cities}
      />

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Faixas em destaque</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {DEFAULT_PRICE_ESTIMATES.map((estimate) => (
            <article key={`${estimate.procedimentoSlug}-${estimate.cidadeSlug}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{estimate.especialidadeSlug}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{estimate.procedimentoSlug.replace(/-/g, " ")}</h3>
              <p className="text-sm text-slate-600">
                {estimate.cidadeNome} - {estimate.uf}
              </p>
              <p className="mt-3 text-sm text-slate-700">{estimate.pacote}</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {formatCurrency(estimate.precoMinimo)} a {formatCurrency(estimate.precoMaximo)}
              </p>
              <div className="mt-3">
                <PriceDisclaimer />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
