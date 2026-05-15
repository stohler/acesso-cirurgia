import Link from "next/link";
import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  FileLock2,
  Handshake,
  Hospital,
  ShieldCheck,
  Users,
} from "lucide-react";

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
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-5">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">Acesso Cirurgia • Simulação guiada</p>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Recupere sua saúde e qualidade de vida sem esperar anos na fila do SUS.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-cyan-50 sm:text-base">
              Encontre cirurgias com valores acessíveis, condições facilitadas e hospitais de qualidade perto de você.
              Faça sua simulação agora e descubra que operar no particular é possível.
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

          <div className="card flex min-h-80 flex-col items-center justify-center gap-4 border-white/20 bg-white/10 p-6 text-center text-white">
            <div className="rounded-full border border-white/40 bg-white/15 p-5">
              <Users size={42} />
            </div>
            <p className="max-w-sm text-sm font-semibold">Placeholder de imagem principal (hero)</p>
            <p className="max-w-sm text-xs text-cyan-100">
              Inserir foto real de pessoa/família sorrindo em ambiente iluminado, transmitindo alívio e retomada da
              qualidade de vida (evitar visual hospitalar frio).
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
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
            <div className="mt-1 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background-soft)] p-4 text-center">
              <Hospital size={24} className="text-[var(--color-primary-blue)]" />
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Placeholder: foto da estrutura de hospital parceiro
              </p>
            </div>
          </article>
        </div>
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

      <section className="card grid gap-5 p-6">
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

          <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background-soft)] p-4 text-center">
            <Users size={28} className="text-[var(--color-primary-blue)]" />
            <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
              Placeholder: equipe médica acolhedora
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Inserir foto da equipe de jaleco transmitindo confiança, acolhimento e profissionalismo.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
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
              Oferecemos opções de parcelamento para que o valor não poise no seu orçamento mensal.
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
