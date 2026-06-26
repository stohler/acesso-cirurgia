"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "#simulador", label: "Simulador" },
  { href: "#destaques", label: "Destaques" },
  { href: "#confiar", label: "Por que confiar" },
  { href: "#experiencia", label: "Nossa experiência" },
  { href: "#faq", label: "FAQ" },
];

type HomeTopNavProps = {
  homePathPrefix?: string;
};

export function HomeTopNav({ homePathPrefix = "" }: HomeTopNavProps) {
  const [open, setOpen] = useState(false);
  const brandHref = homePathPrefix ? "/" : "#inicio";

  return (
    <header className="sticky top-0 z-40 rounded-2xl border border-[var(--color-border)] bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <a href={brandHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-blue)]">
          <Image
            src="https://storage.googleapis.com/acesso-cirurgia-imagens/logo.png"
            alt="Logo Agende Sua Cirurgia"
            width={170}
            height={36}
            className="h-8 w-auto object-contain sm:h-9"
            priority
          />
          <span className="hidden sm:inline">AgendeSuaCirurgia.com.br</span>
        </a>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-primary)] md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Abrir menu principal"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={`${homePathPrefix}${item.href}`}
              className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-blue)]"
            >
              {item.label}
            </a>
          ))}
          <Link href="/medicos/parceiros" className="btn-primary px-3 py-2 text-xs font-semibold">
            Cadastro médico
          </Link>
        </nav>
      </div>

      {open ? (
        <nav className="mt-3 grid gap-2 border-t border-[var(--color-border)] pt-3 text-sm md:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={`${homePathPrefix}${item.href}`}
              className="rounded-lg px-2 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-soft)]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/medicos/parceiros"
            className="btn-primary mt-1 inline-flex w-full items-center justify-center px-3 py-2 text-xs font-semibold"
            onClick={() => setOpen(false)}
          >
            Cadastro médico
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
