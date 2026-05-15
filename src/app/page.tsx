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
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">AgendeSuaCirurgia.com.br • Plataforma oficial</p>
        <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">
          Agende sua cirurgia com mais segurança, previsibilidade de custos e atendimento humanizado perto de você.
        </h1>
        <p className="max-w-4xl text-sm leading-6 text-sky-100 sm:text-base">
          Conectamos pacientes do interior a equipes especializadas, com triagem segura, proteção de dados pela
          LGPD e acompanhamento desde a simulação inicial até o encaminhamento médico.
        </p>
        <ul className="grid gap-2 text-sm text-sky-100 sm:grid-cols-3">
          <li className="rounded-xl border border-sky-300/40 bg-sky-900/30 px-3 py-2">Simulação por região</li>
          <li className="rounded-xl border border-sky-300/40 bg-sky-900/30 px-3 py-2">Triagem online criptografada</li>
          <li className="rounded-xl border border-sky-300/40 bg-sky-900/30 px-3 py-2">Rede médica especializada</li>
        </ul>
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

      <footer className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <p className="text-base font-semibold text-slate-900">ASC Soluções em Saúde Integrada Ltda.</p>
            <p>CNPJ: 00.000.000/0001-00 (placeholder)</p>
            <p>Endereço: Av. Exemplo, 1000 - Centro, Itapetininga/SP (placeholder)</p>
          </div>
          <div className="grid gap-1">
            <p className="font-semibold text-slate-900">Atendimento ao paciente</p>
            <p>Telefone/WhatsApp: (15) 3000-0000 (placeholder)</p>
            <p>E-mail: contato@agendesuacirurgia.com.br (placeholder)</p>
            <p>Horário: Segunda a Sexta, 8h às 18h (placeholder)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <span>Responsável técnico: Dr(a). Nome Sobrenome - CRM 000000 (placeholder)</span>
          <span>Política de Privacidade • Termos de Uso • Canal LGPD (placeholder)</span>
        </div>
      </footer>
    </main>
  );
}
