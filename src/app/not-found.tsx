import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Conteúdo não encontrado</h1>
      <p className="text-sm text-slate-700">
        Não localizamos esta combinação de especialidade, procedimento e cidade na base atual.
      </p>
      <Link href="/" className="text-sm font-semibold text-sky-700 hover:text-sky-900">
        Voltar para a busca
      </Link>
    </main>
  );
}
