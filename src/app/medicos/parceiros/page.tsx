import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { DoctorPartnerForm } from "@/components/forms/doctor-partner-form";
import { getCatalogData } from "@/lib/catalog-service";

export default async function MedicosParceirosPage() {
  const catalog = await getCatalogData();

  return (
    <main className="grid gap-6">
      <header className="card grid gap-4 p-6">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="grid gap-3">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Faça parte da rede Acesso Cirurgia
            </h1>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              Você não paga nada para se cadastrar. Receba pacientes com triagem inicial estruturada, tenha
              visibilidade regional e decida, com autonomia clínica, sobre cada caso encaminhado.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <Image
              src="https://storage.googleapis.com/acesso-cirurgia-imagens/medico-1.png"
              alt="Médico parceiro da rede Acesso Cirurgia"
              width={1600}
              height={900}
              className="h-56 w-full object-cover"
            />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-3 text-sm text-[var(--color-text-primary)]">
            <p className="font-semibold">Sem custo para o médico</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Não há taxa para análise do seu cadastro.</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-3 text-sm text-[var(--color-text-primary)]">
            <p className="font-semibold">Pacientes pré-triados</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Encaminhamento com dados clínicos iniciais.</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-3 text-sm text-[var(--color-text-primary)]">
            <p className="font-semibold">Curadoria Acesso Saúde</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              O cadastro pode ser aprovado ou não, conforme compliance e qualidade assistencial.
            </p>
          </div>
        </div>
        <Link href="/" className="text-sm font-semibold text-[var(--color-primary-blue-light)] hover:underline">
          Voltar para página principal
        </Link>
      </header>

      <section className="card grid gap-3 p-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Benefícios para o médico parceiro</h2>
        <ul className="grid gap-2 text-sm text-[var(--color-text-secondary)]">
          <li className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--color-success)]" />
            Fluxo digital com triagem inicial do paciente e dados organizados.
          </li>
          <li className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--color-success)]" />
            Exposição para pacientes do SUS que buscam alternativa particular acessível.
          </li>
          <li className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--color-success)]" />
            Gestão regional por procedimento com autonomia de agenda e avaliação.
          </li>
        </ul>
      </section>

      <DoctorPartnerForm specialties={catalog.specialties} procedures={catalog.procedures} />
    </main>
  );
}
