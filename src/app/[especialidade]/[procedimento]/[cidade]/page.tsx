import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { UserRoundCheck } from "lucide-react";

import { PriceDisclaimer } from "@/components/seo/price-disclaimer";
import { findPriceEstimate, getCatalogData } from "@/lib/catalog-service";
import { getLocalDoctors, registerSearchEvent } from "@/lib/discovery-service";
import { formatCurrency } from "@/lib/utils";

type RouteProps = {
  params: Promise<{
    especialidade: string;
    procedimento: string;
    cidade: string;
  }>;
  searchParams: Promise<{
    uf?: string;
    cidadeNome?: string;
  }>;
};

export const dynamic = "force-dynamic";

function formatSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function loadPageData({
  especialidade,
  procedimento,
  cidade,
  ufFromQuery,
  cidadeNomeFromQuery,
}: {
  especialidade: string;
  procedimento: string;
  cidade: string;
  ufFromQuery?: string;
  cidadeNomeFromQuery?: string;
}) {
  const [catalog, estimate] = await Promise.all([
    getCatalogData(),
    findPriceEstimate(especialidade, procedimento, cidade),
  ]);

  const specialty = catalog.specialties.find((item) => item.slug === especialidade);
  const procedure = catalog.procedures.find((item) => item.slug === procedimento);
  const city = catalog.cities.find((item) => item.slug === cidade);
  const cidadeNome = city?.nome ?? cidadeNomeFromQuery ?? formatSlug(cidade);
  const uf = city?.uf ?? ufFromQuery ?? "BR";

  const doctors = estimate
    ? await getLocalDoctors({
        especialidadeSlug: especialidade,
        procedimentoSlug: procedimento,
        cidadeSlug: cidade,
        cidadeNome,
        uf,
      })
    : [];

  return {
    specialty,
    procedure,
    city: {
      slug: cidade,
      nome: cidadeNome,
      uf,
    },
    estimate,
    doctors,
  };
}

export async function generateMetadata({ params, searchParams }: RouteProps): Promise<Metadata> {
  const resolved = await params;
  const resolvedSearch = await searchParams;
  const data = await loadPageData({
    ...resolved,
    ufFromQuery: resolvedSearch.uf,
    cidadeNomeFromQuery: resolvedSearch.cidadeNome,
  });

  if (!data.estimate || !data.specialty || !data.procedure) {
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

export default async function PriceByLocationPage({ params, searchParams }: RouteProps) {
  const resolved = await params;
  const resolvedSearch = await searchParams;
  const data = await loadPageData({
    ...resolved,
    ufFromQuery: resolvedSearch.uf,
    cidadeNomeFromQuery: resolvedSearch.cidadeNome,
  });

  const requestHeaders = await headers();
  await registerSearchEvent({
    especialidadeSlug: resolved.especialidade,
    procedimentoSlug: resolved.procedimento,
    cidadeSlug: resolved.cidade,
    cidadeNome: data.city.nome,
    uf: data.city.uf,
    hasPriceEstimate: Boolean(data.estimate),
    doctorsFound: data.doctors.length,
    userAgent: requestHeaders.get("user-agent"),
    ip: requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip"),
  });

  if (!data.specialty || !data.procedure) {
    return (
      <main className="grid gap-6">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-red-800">Especialidade ou procedimento não encontrados</h1>
          <p className="mt-2 text-sm text-red-700">
            Não encontramos essa combinação no catálogo atual. Revise os dados da busca ou tente outro procedimento.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Voltar para nova busca
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!data.estimate) {
    return (
      <main className="grid gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {data.procedure.nome} em {data.city.nome} - {data.city.uf}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Especialidade: <strong>{data.specialty.nome}</strong>
          </p>
        </header>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-800">Procedimento e cidade ainda não cadastrados</h2>
          <p className="mt-2 text-sm leading-6 text-red-700">
            Ainda não temos faixa de valor para esta combinação de procedimento e localidade. Nosso time pode incluir
            essa região no próximo ciclo de atualização.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/triagem"
              className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Entrar na lista de interesse
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Fazer nova busca
            </Link>
          </div>
        </section>
      </main>
    );
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

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Médicos disponíveis na sua localidade</h2>
        {data.doctors.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            Ainda não há médicos exibidos para este local. Continue com a triagem e nosso time fará o
            encaminhamento.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.doctors.map((doctor) => (
              <article key={doctor.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-sky-100 p-2 text-sky-700">
                    <UserRoundCheck size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{doctor.nome}</h3>
                    <p className="text-xs text-slate-500">
                      CRM {doctor.crm}-{doctor.crmUf}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{doctor.enderecoProcedimento}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-700">
                  Valor médio do pacote:{" "}
                  <strong>{formatCurrency(doctor.valorMedioPacote)}</strong>
                </p>
                <p className="text-xs text-slate-500">Contato: {doctor.telefone}</p>

                <Link
                  href={`/triagem?especialidade=${resolved.especialidade}&procedimento=${resolved.procedimento}&cidade=${resolved.cidade}&medicoId=${doctor.id}&medicoNome=${encodeURIComponent(doctor.nome)}`}
                  className="mt-4 inline-flex rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                >
                  Selecionar médico e iniciar triagem
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
