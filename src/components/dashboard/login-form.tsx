"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, senha }),
        });

        if (!response.ok) {
          setError("Credenciais inválidas ou acesso indisponível.");
          setLoading(false);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      }}
    >
      <h1 className="text-xl font-semibold text-slate-900">Acesso médico</h1>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        E-mail
        <input
          type="email"
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Senha
        <input
          type="password"
          className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-600"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Autenticando..." : "Entrar no dashboard"}
      </button>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
