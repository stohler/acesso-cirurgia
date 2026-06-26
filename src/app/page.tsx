import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  FileLock2,
  Handshake,
  ShieldCheck,
} from "lucide-react";

import { HomeSearchForm } from "@/components/forms/home-search-form";
import { HomeTopNav } from "@/components/sections/home-top-nav";
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel";
import { PriceDisclaimer } from "@/components/seo/price-disclaimer";
import { getCatalogData, getFeaturedPriceEstimates } from "@/lib/catalog-service";
import { formatCurrency } from "@/lib/utils";

function humanizeSlug(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function Home() {
  const [catalog, featuredEstimates] = await Promise.all([getCatalogData(), getFeaturedPriceEstimates(6)]);
  const specialtyNameBySlug = new Map(catalog.specialties.map((item) => [item.slug, item.nome]));
  const procedureNameBySlug = new Map(catalog.procedures.map((item) => [item.slug, item.nome]));

  return (
    <main className="grid gap-8 pb-4">
      <HomeTopNav />

      <section id="inicio" className="hero scroll-mt-24 overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-5">
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Realize sua cirurgia com segurança, transparência e acompanhamento especializado.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-cyan-50 sm:text-base">
              Conectamos você a médicos, hospitais e equipes cirúrgicas qualificadas, com atendimento humanizado do
              orçamento ao pós-operatório.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href="#simulador" className="btn-primary px-5 py-3 font-semibold">
                Começar Simulação
              </a>
              <Link href="/triagem" className="btn-secondary px-5 py-3 font-semibold">
                Quero enviar minha triagem
              </Link>
            </div>

            <div id="simulador">
              <HomeSearchForm
                specialties={catalog.specialties}
                procedures={catalog.procedures}
                cities={catalog.cities}
              />
            </div>
          </div>

          <div className="card overflow-hidden border-white/20 bg-white/10">
            <Image
              src="https://storage.googleapis.com/acesso-cirurgia-imagens/hero-1.png"
              alt="Família feliz em ambiente iluminado representando alívio após resolver cirurgia"
              width={1600}
              height={1000}
              className="h-auto max-h-[520px] w-full object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <section id="beneficios" className="scroll-mt-24 grid gap-4">
        <h2 className="text-center text-2xl font-semibold">Por que milhares de pacientes estão buscando alternativas ao SUS?</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="card grid gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-[#2BB6731A] p-2 text-[var(--color-success)]">
                <CalendarCheck2 size={20} />
              </span>
              <h3 className="text-lg font-semibold">Chega de Espera</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Não deixe sua condição piorar. O que o SUS demora meses (ou anos) para agendar, nós ajudamos você a
              resolver em semanas.
            </p>
          </article>

          <article className="card grid gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-[#00B7A81A] p-2 text-[var(--color-primary-green)]">
                <Handshake size={20} />
              </span>
              <h3 className="text-lg font-semibold">Preços que Cabem no Bolso</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Trabalhamos com pacotes previsíveis (hospital + equipe + materiais) para que você não tenha surpresas na
              conta final.
            </p>
          </article>

          <article className="card grid gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-[#003B841A] p-2 text-[var(--color-primary-blue)]">
                <ShieldCheck size={20} />
              </span>
              <h3 className="text-lg font-semibold">Segurança Total</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Triagem digital humanizada e hospitais parceiros selecionados para garantir que sua única preocupação
              seja a sua recuperação.
            </p>
            <div className="mt-1 overflow-hidden rounded-xl border border-[var(--color-border)]">
              <Image
                src="https://storage.googleapis.com/acesso-cirurgia-imagens/hospital-1.png"
                alt="Estrutura de hospital parceiro"
                width={1200}
                height={900}
                className="h-40 w-full object-cover"
              />
            </div>
          </article>
        </div>
      </section>

      <section id="destaques" className="scroll-mt-24 grid gap-4">
        <h2 className="text-xl font-semibold">Faixas estimadas em destaque</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {featuredEstimates.map((estimate) => (
            <article key={`${estimate.procedimentoSlug}-${estimate.cidadeSlug}`} className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-blue-light)]">
                {specialtyNameBySlug.get(estimate.especialidadeSlug) ?? humanizeSlug(estimate.especialidadeSlug)}
              </p>
              <h3 className="mt-1 text-lg font-semibold">
                {procedureNameBySlug.get(estimate.procedimentoSlug) ?? humanizeSlug(estimate.procedimentoSlug)}
              </h3>
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

      <section id="confiar" className="card scroll-mt-24 grid gap-5 p-6">
        <div>
          <h2 className="text-2xl font-semibold">Por que confiar?</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Por que pacientes escolhem nossa equipe?</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Atendimento humanizado em todas as etapas",
            "Médicos e hospitais criteriosamente selecionados",
            "Transparência nos custos e no processo cirúrgico",
            "Acompanhamento pré e pós-operatório",
            "Segurança de dados e conformidade com a LGPD",
            "Suporte rápido via WhatsApp",
          ].map((item) => (
            <div
              key={item}
              className="inline-flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] px-3 py-3 text-sm text-[var(--color-text-primary)]"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="experiencia" className="card scroll-mt-24 grid gap-5 p-6">
        <h2 className="text-2xl font-semibold">Nossa experiência</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-4">
            <p className="text-3xl font-bold text-[var(--color-primary-blue)]">+1.200</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">pacientes atendidos</p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-4">
            <p className="text-3xl font-bold text-[var(--color-primary-blue)]">Rede ativa</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              com médicos e hospitais parceiros
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-4">
            <p className="text-3xl font-bold text-[var(--color-primary-blue)]">Multiespecialidades</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              atendimento em múltiplas especialidades
            </p>
          </article>
        </div>
      </section>

      <TestimonialsCarousel />

      <section id="seguranca" className="card scroll-mt-24 grid gap-5 p-6">
        <h2 className="text-2xl font-semibold">Seus dados protegidos, sua saúde em boas mãos.</h2>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              Utilizamos criptografia de ponta a ponta para analisar sua elegibilidade cirúrgica. Nosso foco é
              conectar você ao médico certo, com a transparência que a sua saúde merece.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                <FileLock2 size={14} /> Ambiente Seguro
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                <ShieldCheck size={14} /> Conforme a LGPD
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                <Building2 size={14} /> Hospitais parceiros
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <Image
              src="https://storage.googleapis.com/acesso-cirurgia-imagens/equipe-1.png"
              alt="Equipe médica acolhedora transmitindo confiança e profissionalismo"
              width={1400}
              height={1000}
              className="h-56 w-full object-cover"
            />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-4">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Responsabilidade médica</h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Todos os procedimentos são realizados por médicos regularmente inscritos no CRM e em hospitais parceiros.
          </p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 grid gap-4">
        <h2 className="text-2xl font-semibold">Perguntas frequentes</h2>
        <div className="grid gap-3">
          <article className="card p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <CheckCircle2 size={18} className="text-[var(--color-primary-green)]" />
              Preciso de plano de saúde?
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Não. Nosso foco é o atendimento particular com preços sociais e acessíveis.
            </p>
          </article>
          <article className="card p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <CircleDollarSign size={18} className="text-[var(--color-primary-green)]" />
              Como são feitos os pagamentos?
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Os pagamentos são combinados diretamente com a equipe, temos parceria com a Sicredi para orçamento de
              crédito para cirurgias.
            </p>
          </article>
          <article className="card p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <CalendarCheck2 size={18} className="text-[var(--color-primary-green)]" />
              A cirurgia demora para acontecer?
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Após a avaliação presencial e exames, o agendamento é imediato, conforme a disponibilidade da equipe
              médica.
            </p>
          </article>
        </div>
      </section>

      <footer className="card grid gap-4 p-5 text-sm text-[var(--color-text-secondary)]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <p className="text-base font-semibold text-[var(--color-text-primary)]">ASC Soluções em Saúde Integrada Ltda.</p>
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
