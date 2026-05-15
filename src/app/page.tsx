import Image from "next/image";
import Link from "next/link";

import { HomeSearchForm } from "@/components/forms/home-search-form";
import { PriceDisclaimer } from "@/components/seo/price-disclaimer";
import { DEFAULT_PRICE_ESTIMATES } from "@/lib/constants";
import { getCatalogData } from "@/lib/catalog-service";
import { formatCurrency } from "@/lib/utils";

export default async function Home() {
  const catalog = await getCatalogData();

  return (
    <main className="grid gap-8 pb-4">
      <section className="hero overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">
              Acesso Cirurgia • Plataforma de agendamento seguro
            </p>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Encontre onde operar com segurança, valores mais acessíveis e atendimento humanizado perto de você.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-cyan-50 sm:text-base">
              Ajudamos pacientes a comparar opções cirúrgicas no interior, organizar a triagem online e seguir para a
              avaliação médica com clareza e proteção total de dados pela LGPD.
            </p>

            <ul className="grid gap-2 text-sm text-cyan-50 sm:grid-cols-3">
              <li className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Hospitais e equipes parceiras</li>
              <li className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Fluxo guiado de decisão</li>
              <li className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Triagem criptografada ponta a ponta</li>
            </ul>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/triagem" className="btn-primary px-5 py-3 font-semibold">
                Iniciar triagem avançada
              </Link>
              <Link href="/dashboard/login" className="btn-secondary px-5 py-3 font-semibold">
                Acesso médico
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="card bg-white/95 p-4">
              <Image
                src="/branding/logo-acesso-cirurgia.svg"
                alt="Logo Acesso Cirurgia"
                width={640}
                height={240}
                className="h-auto w-full"
                priority
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card p-2">
                <Image
                  src="/branding/highlight-encontre.svg"
                  alt="Encontre lugares com preços acessíveis"
                  width={760}
                  height={180}
                  className="h-auto w-full rounded-xl"
                />
              </div>
              <div className="card p-2">
                <Image
                  src="/branding/highlight-sem-fila.svg"
                  alt="Sem fila, realize seu procedimento sem esperar no SUS"
                  width={760}
                  height={180}
                  className="h-auto w-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <HomeSearchForm
          specialties={catalog.specialties}
          procedures={catalog.procedures}
          cities={catalog.cities}
        />
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Faixas estimadas em destaque</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {DEFAULT_PRICE_ESTIMATES.map((estimate) => (
            <article key={`${estimate.procedimentoSlug}-${estimate.cidadeSlug}`} className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-blue-light)]">
                {estimate.especialidadeSlug}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{estimate.procedimentoSlug.replace(/-/g, " ")}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {estimate.cidadeNome} - {estimate.uf}
              </p>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{estimate.pacote}</p>
              <p className="mt-2 text-lg font-bold">
                {formatCurrency(estimate.precoMinimo)} a {formatCurrency(estimate.precoMaximo)}
              </p>
              <div className="mt-3">
                <PriceDisclaimer />
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="card grid gap-4 p-5 text-sm text-[var(--color-text-secondary)]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <div className="mb-2 flex items-center gap-3">
              <Image
                src="/branding/brand-icon.svg"
                alt="Símbolo Acesso Cirurgia"
                width={54}
                height={54}
                className="h-12 w-12"
              />
              <p className="text-base font-semibold text-[var(--color-text-primary)]">ASC Soluções em Saúde Integrada Ltda.</p>
            </div>
            <p>CNPJ: 00.000.000/0001-00 (placeholder)</p>
            <p>Endereço: Av. Exemplo, 1000 - Centro, Itapetininga/SP (placeholder)</p>
          </div>
          <div className="grid gap-1">
            <p className="font-semibold text-[var(--color-text-primary)]">Atendimento ao paciente</p>
            <p>Telefone/WhatsApp: (15) 3000-0000 (placeholder)</p>
            <p>E-mail: contato@agendesuacirurgia.com.br (placeholder)</p>
            <p>Horário: Segunda a Sexta, 8h às 18h (placeholder)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <span>Responsável técnico: Dr(a). Nome Sobrenome - CRM 000000 (placeholder)</span>
          <span>Política de Privacidade • Termos de Uso • Canal LGPD (placeholder)</span>
        </div>
      </footer>
    </main>
  );
}
