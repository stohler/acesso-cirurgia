type SearchStatsPanelProps = {
  totalSearches: number;
  withPriceEstimate: number;
  withoutPriceEstimate: number;
  topCities: Array<{ label: string; total: number }>;
  topProcedures: Array<{ label: string; total: number }>;
};

export function SearchStatsPanel({
  totalSearches,
  withPriceEstimate,
  withoutPriceEstimate,
  topCities,
  topProcedures,
}: SearchStatsPanelProps) {
  return (
    <section className="grid gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Estatísticas de pesquisas</h2>
        <p className="text-sm text-slate-600">Medição das buscas realizadas na landing por localidade/procedimento.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total de pesquisas</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalSearches.toLocaleString("pt-BR")}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Com preço cadastrado</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{withPriceEstimate.toLocaleString("pt-BR")}</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-amber-700">Sem preço cadastrado</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{withoutPriceEstimate.toLocaleString("pt-BR")}</p>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Cidades mais buscadas</h3>
          <ul className="mt-2 grid gap-2 text-sm text-slate-700">
            {topCities.length === 0 ? <li>Nenhum dado ainda.</li> : null}
            {topCities.map((city) => (
              <li key={city.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{city.label}</span>
                <strong>{city.total.toLocaleString("pt-BR")}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Procedimentos mais buscados</h3>
          <ul className="mt-2 grid gap-2 text-sm text-slate-700">
            {topProcedures.length === 0 ? <li>Nenhum dado ainda.</li> : null}
            {topProcedures.map((procedure) => (
              <li key={procedure.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{procedure.label}</span>
                <strong>{procedure.total.toLocaleString("pt-BR")}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
