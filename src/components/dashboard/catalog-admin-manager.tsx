"use client";

import { useMemo, useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";

type AdminSpecialty = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  active: boolean;
};

type AdminProcedure = {
  id: string;
  slug: string;
  especialidadeSlug: string;
  nome: string;
  descricao: string;
  active: boolean;
};

type CatalogAdminManagerProps = {
  initialSpecialties: AdminSpecialty[];
  initialProcedures: AdminProcedure[];
};

export function CatalogAdminManager({
  initialSpecialties,
  initialProcedures,
}: CatalogAdminManagerProps) {
  const [specialties, setSpecialties] = useState(initialSpecialties);
  const [procedures, setProcedures] = useState(initialProcedures);
  const [statusMessage, setStatusMessage] = useState("");

  const [newSpecialty, setNewSpecialty] = useState({
    slug: "",
    nome: "",
    descricao: "",
  });
  const [newProcedure, setNewProcedure] = useState({
    slug: "",
    especialidadeSlug: initialSpecialties[0]?.slug ?? "",
    nome: "",
    descricao: "",
  });

  const [editingSpecialtyId, setEditingSpecialtyId] = useState<string | null>(null);
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(null);
  const [specialtyDraft, setSpecialtyDraft] = useState({
    slug: "",
    nome: "",
    descricao: "",
    active: true,
  });
  const [procedureDraft, setProcedureDraft] = useState({
    slug: "",
    especialidadeSlug: "",
    nome: "",
    descricao: "",
    active: true,
  });

  const specialtyNameBySlug = useMemo(
    () => new Map(specialties.map((item) => [item.slug, item.nome])),
    [specialties],
  );

  async function createSpecialty() {
    setStatusMessage("Criando especialidade...");
    try {
      const response = await fetch("/api/admin/catalog/specialties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSpecialty),
      });
      const payload = (await response.json()) as {
        error?: string;
        specialty?: AdminSpecialty;
      };
      if (!response.ok || !payload.specialty) {
        throw new Error(payload.error ?? "Erro ao criar especialidade.");
      }
      const createdSpecialty = payload.specialty;

      setSpecialties((prev) => [...prev, createdSpecialty].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNewSpecialty({ slug: "", nome: "", descricao: "" });
      setStatusMessage("Especialidade criada com sucesso.");
    } catch (error) {
      setStatusMessage(String(error));
    }
  }

  async function createProcedure() {
    setStatusMessage("Criando procedimento...");
    try {
      const response = await fetch("/api/admin/catalog/procedures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProcedure),
      });
      const payload = (await response.json()) as {
        error?: string;
        procedure?: AdminProcedure;
      };
      if (!response.ok || !payload.procedure) {
        throw new Error(payload.error ?? "Erro ao criar procedimento.");
      }
      const createdProcedure = payload.procedure;

      setProcedures((prev) => [...prev, createdProcedure].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNewProcedure((prev) => ({ ...prev, slug: "", nome: "", descricao: "" }));
      setStatusMessage("Procedimento criado com sucesso.");
    } catch (error) {
      setStatusMessage(String(error));
    }
  }

  async function saveSpecialty(id: string) {
    setStatusMessage("Salvando especialidade...");
    try {
      const response = await fetch(`/api/admin/catalog/specialties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specialtyDraft),
      });
      const payload = (await response.json()) as {
        error?: string;
        specialty?: AdminSpecialty;
      };
      if (!response.ok || !payload.specialty) {
        throw new Error(payload.error ?? "Erro ao salvar especialidade.");
      }
      const updatedSpecialty = payload.specialty;

      setSpecialties((prev) =>
        prev.map((item) => (item.id === id ? updatedSpecialty : item)).sort((a, b) => a.nome.localeCompare(b.nome)),
      );
      setEditingSpecialtyId(null);
      setStatusMessage("Especialidade atualizada.");
    } catch (error) {
      setStatusMessage(String(error));
    }
  }

  async function saveProcedure(id: string) {
    setStatusMessage("Salvando procedimento...");
    try {
      const response = await fetch(`/api/admin/catalog/procedures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(procedureDraft),
      });
      const payload = (await response.json()) as {
        error?: string;
        procedure?: AdminProcedure;
      };
      if (!response.ok || !payload.procedure) {
        throw new Error(payload.error ?? "Erro ao salvar procedimento.");
      }
      const updatedProcedure = payload.procedure;

      setProcedures((prev) =>
        prev.map((item) => (item.id === id ? updatedProcedure : item)).sort((a, b) => a.nome.localeCompare(b.nome)),
      );
      setEditingProcedureId(null);
      setStatusMessage("Procedimento atualizado.");
    } catch (error) {
      setStatusMessage(String(error));
    }
  }

  async function removeSpecialty(id: string) {
    setStatusMessage("Removendo especialidade...");
    try {
      const response = await fetch(`/api/admin/catalog/specialties/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Erro ao remover especialidade.");
      }

      setSpecialties((prev) => prev.filter((item) => item.id !== id));
      setStatusMessage("Especialidade removida.");
    } catch (error) {
      setStatusMessage(String(error));
    }
  }

  async function removeProcedure(id: string) {
    setStatusMessage("Removendo procedimento...");
    try {
      const response = await fetch(`/api/admin/catalog/procedures/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Erro ao remover procedimento.");
      }

      setProcedures((prev) => prev.filter((item) => item.id !== id));
      setStatusMessage("Procedimento removido.");
    } catch (error) {
      setStatusMessage(String(error));
    }
  }

  return (
    <section className="grid gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">CRUD de especialidades e procedimentos padrão</h2>
        <p className="text-sm text-slate-600">
          Área exclusiva de superadmin para manter o catálogo padrão da plataforma.
        </p>
        {statusMessage ? <p className="mt-2 text-xs text-slate-700">{statusMessage}</p> : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Nova especialidade</h3>
          <div className="mt-2 grid gap-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Nome (ex: Ginecologia)"
              value={newSpecialty.nome}
              onChange={(event) => setNewSpecialty((prev) => ({ ...prev, nome: event.target.value }))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Slug opcional (ex: ginecologia)"
              value={newSpecialty.slug}
              onChange={(event) => setNewSpecialty((prev) => ({ ...prev, slug: event.target.value }))}
            />
            <textarea
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Descrição"
              value={newSpecialty.descricao}
              onChange={(event) => setNewSpecialty((prev) => ({ ...prev, descricao: event.target.value }))}
            />
            <button
              type="button"
              className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              onClick={createSpecialty}
            >
              Criar especialidade
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Novo procedimento</h3>
          <div className="mt-2 grid gap-2">
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={newProcedure.especialidadeSlug}
              onChange={(event) =>
                setNewProcedure((prev) => ({ ...prev, especialidadeSlug: event.target.value }))
              }
            >
              {specialties.map((specialty) => (
                <option key={`new-proc-${specialty.id}`} value={specialty.slug}>
                  {specialty.nome}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Nome do procedimento"
              value={newProcedure.nome}
              onChange={(event) => setNewProcedure((prev) => ({ ...prev, nome: event.target.value }))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Slug opcional"
              value={newProcedure.slug}
              onChange={(event) => setNewProcedure((prev) => ({ ...prev, slug: event.target.value }))}
            />
            <textarea
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Descrição"
              value={newProcedure.descricao}
              onChange={(event) => setNewProcedure((prev) => ({ ...prev, descricao: event.target.value }))}
            />
            <button
              type="button"
              className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              onClick={createProcedure}
            >
              Criar procedimento
            </button>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Especialidades cadastradas</h3>
        <div className="mt-2 grid gap-2">
          {specialties.map((specialty) => (
            <div key={specialty.id} className="rounded-lg border border-slate-200 p-3">
              {editingSpecialtyId === specialty.id ? (
                <div className="grid gap-2">
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={specialtyDraft.nome}
                    onChange={(event) => setSpecialtyDraft((prev) => ({ ...prev, nome: event.target.value }))}
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={specialtyDraft.slug}
                    onChange={(event) => setSpecialtyDraft((prev) => ({ ...prev, slug: event.target.value }))}
                  />
                  <textarea
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={specialtyDraft.descricao}
                    onChange={(event) =>
                      setSpecialtyDraft((prev) => ({ ...prev, descricao: event.target.value }))
                    }
                  />
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={specialtyDraft.active}
                      onChange={(event) =>
                        setSpecialtyDraft((prev) => ({ ...prev, active: event.target.checked }))
                      }
                    />
                    Ativa
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                      onClick={() => saveSpecialty(specialty.id)}
                    >
                      <Save size={12} />
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                      onClick={() => setEditingSpecialtyId(null)}
                    >
                      <X size={12} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{specialty.nome}</p>
                    <p className="text-xs text-slate-600">{specialty.slug}</p>
                    <p className="text-xs text-slate-500">{specialty.descricao}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Status: {specialty.active ? "ativa" : "inativa"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                      onClick={() => {
                        setEditingSpecialtyId(specialty.id);
                        setSpecialtyDraft({
                          slug: specialty.slug,
                          nome: specialty.nome,
                          descricao: specialty.descricao,
                          active: specialty.active,
                        });
                      }}
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
                      onClick={() => removeSpecialty(specialty.id)}
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Procedimentos cadastrados</h3>
        <div className="mt-2 grid gap-2">
          {procedures.map((procedure) => (
            <div key={procedure.id} className="rounded-lg border border-slate-200 p-3">
              {editingProcedureId === procedure.id ? (
                <div className="grid gap-2">
                  <select
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={procedureDraft.especialidadeSlug}
                    onChange={(event) =>
                      setProcedureDraft((prev) => ({ ...prev, especialidadeSlug: event.target.value }))
                    }
                  >
                    {specialties.map((specialty) => (
                      <option key={`edit-proc-${specialty.id}`} value={specialty.slug}>
                        {specialty.nome}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={procedureDraft.nome}
                    onChange={(event) => setProcedureDraft((prev) => ({ ...prev, nome: event.target.value }))}
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={procedureDraft.slug}
                    onChange={(event) => setProcedureDraft((prev) => ({ ...prev, slug: event.target.value }))}
                  />
                  <textarea
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={procedureDraft.descricao}
                    onChange={(event) =>
                      setProcedureDraft((prev) => ({ ...prev, descricao: event.target.value }))
                    }
                  />
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={procedureDraft.active}
                      onChange={(event) =>
                        setProcedureDraft((prev) => ({ ...prev, active: event.target.checked }))
                      }
                    />
                    Ativo
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                      onClick={() => saveProcedure(procedure.id)}
                    >
                      <Save size={12} />
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                      onClick={() => setEditingProcedureId(null)}
                    >
                      <X size={12} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{procedure.nome}</p>
                    <p className="text-xs text-slate-600">
                      {procedure.slug} • {specialtyNameBySlug.get(procedure.especialidadeSlug) ?? procedure.especialidadeSlug}
                    </p>
                    <p className="text-xs text-slate-500">{procedure.descricao}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Status: {procedure.active ? "ativo" : "inativo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                      onClick={() => {
                        setEditingProcedureId(procedure.id);
                        setProcedureDraft({
                          slug: procedure.slug,
                          especialidadeSlug: procedure.especialidadeSlug,
                          nome: procedure.nome,
                          descricao: procedure.descricao,
                          active: procedure.active,
                        });
                      }}
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
                      onClick={() => removeProcedure(procedure.id)}
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
