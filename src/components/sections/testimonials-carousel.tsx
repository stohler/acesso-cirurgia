"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Testimonial = {
  id: number;
  nome: string;
  cidade: string;
  procedimento: string;
  depoimento: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    nome: "Maria A.",
    cidade: "Sorocaba/SP",
    procedimento: "Vesícula",
    depoimento:
      "Eu estava há muito tempo esperando e sofrendo com dor. Com o Acesso Cirurgia consegui entender valores e fui atendida rápido.",
  },
  {
    id: 2,
    nome: "João P.",
    cidade: "Campinas/SP",
    procedimento: "Hérnia",
    depoimento:
      "O atendimento foi claro desde o início. Ter noção do pacote e condições de pagamento me deu segurança para seguir.",
  },
  {
    id: 3,
    nome: "Patrícia M.",
    cidade: "Belo Horizonte/MG",
    procedimento: "Hemorroida",
    depoimento:
      "A triagem online ajudou muito e o processo foi bem humano. Em poucas semanas já estava com data de avaliação.",
  },
  {
    id: 4,
    nome: "Carlos R.",
    cidade: "Curitiba/PR",
    procedimento: "Hérnia",
    depoimento:
      "Achei que seria impossível no particular, mas consegui um plano viável e sem surpresa de preço no final.",
  },
  {
    id: 5,
    nome: "Sandra L.",
    cidade: "Goiânia/GO",
    procedimento: "Vesícula",
    depoimento:
      "Depois de meses na fila, consegui avançar com consulta e cirurgia em tempo muito menor do que eu imaginava.",
  },
  {
    id: 6,
    nome: "Rogério S.",
    cidade: "Ribeirão Preto/SP",
    procedimento: "Hérnia",
    depoimento:
      "Gostei da transparência com valores e da explicação do que estava incluso no pacote. Isso fez total diferença.",
  },
  {
    id: 7,
    nome: "Fernanda C.",
    cidade: "Londrina/PR",
    procedimento: "Vesícula",
    depoimento:
      "Fui acolhida desde o primeiro contato. Tudo muito organizado e com atenção real à minha necessidade.",
  },
  {
    id: 8,
    nome: "Luciano D.",
    cidade: "Uberlândia/MG",
    procedimento: "Hemorroida",
    depoimento:
      "Consegui parcelar e planejar sem comprometer todo o orçamento da família. Atendimento de confiança.",
  },
  {
    id: 9,
    nome: "Renata F.",
    cidade: "Florianópolis/SC",
    procedimento: "Vesícula",
    depoimento:
      "O processo foi rápido e objetivo. Me senti segura com a equipe e com a forma de orientação da plataforma.",
  },
  {
    id: 10,
    nome: "Eduardo B.",
    cidade: "São José dos Campos/SP",
    procedimento: "Hérnia",
    depoimento:
      "A possibilidade de comparar e já iniciar o fluxo online me ajudou a tomar decisão sem ficar esperando.",
  },
];

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);

  const currentItem = useMemo(() => TESTIMONIALS[current], [current]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="card grid gap-4 p-6">
      <header className="grid gap-1">
        <h2 className="text-2xl font-semibold">Quem passou pelo processo recomenda</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Relatos de pacientes que buscaram alternativa ao SUS com pacote acessível e previsível.
        </p>
      </header>

      <article className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-soft)] p-5">
        <Quote className="text-[var(--color-primary-green)]" size={22} />
        <p className="mt-3 text-base leading-7 text-[var(--color-text-primary)]">{currentItem.depoimento}</p>
        <p className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">
          {currentItem.nome} • {currentItem.cidade}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">Procedimento: {currentItem.procedimento}</p>
      </article>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1">
          {TESTIMONIALS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrent(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                current === index ? "bg-[var(--color-primary-blue)]" : "bg-[var(--color-border)]"
              }`}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-soft)]"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length)}
            className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-soft)]"
            aria-label="Próximo depoimento"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
