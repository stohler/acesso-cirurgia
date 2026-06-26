import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { ensureInitialCatalogSeed } from "@/lib/default-catalog-seed";
import { connectToDatabase } from "@/lib/mongodb";
import { isSuperAdminEmail } from "@/lib/superadmin";
import { toSlug } from "@/lib/utils";
import { ProcedureModel } from "@/models/Procedure";
import { SpecialtyModel } from "@/models/Specialty";

const bodySchema = z.object({
  slug: z.string().min(2).optional(),
  especialidadeSlug: z.string().min(2),
  nome: z.string().min(2),
  descricao: z.string().min(4).max(500).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isSuperAdminEmail(session.email)) {
    return NextResponse.json({ error: "Acesso permitido apenas para superadmin." }, { status: 403 });
  }

  await connectToDatabase();
  await ensureInitialCatalogSeed();
  const procedures = await ProcedureModel.find({}).sort({ nome: 1 }).lean();

  return NextResponse.json({
    procedures: procedures.map((procedure) => ({
      id: String(procedure._id),
      slug: procedure.slug,
      especialidadeSlug: procedure.especialidadeSlug,
      nome: procedure.nome,
      descricao: procedure.descricao,
      active: procedure.active,
      createdAt: procedure.createdAt,
      updatedAt: procedure.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isSuperAdminEmail(session.email)) {
    return NextResponse.json({ error: "Acesso permitido apenas para superadmin." }, { status: 403 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    await connectToDatabase();

    const specialty = await SpecialtyModel.findOne({ slug: body.especialidadeSlug }).lean();
    if (!specialty) {
      return NextResponse.json({ error: "Especialidade não encontrada." }, { status: 404 });
    }

    const slug = toSlug(body.slug || body.nome);
    const existing = await ProcedureModel.findOne({ slug, especialidadeSlug: body.especialidadeSlug }).lean();
    if (existing) {
      return NextResponse.json({ error: "Já existe procedimento com este slug na especialidade." }, { status: 409 });
    }

    const created = await ProcedureModel.create({
      slug,
      especialidadeSlug: body.especialidadeSlug,
      nome: body.nome.trim(),
      descricao: body.descricao?.trim() || `Procedimento ${body.nome.trim()}.`,
      active: body.active ?? true,
    });

    return NextResponse.json(
      {
        ok: true,
        procedure: {
          id: String(created._id),
          slug: created.slug,
          especialidadeSlug: created.especialidadeSlug,
          nome: created.nome,
          descricao: created.descricao,
          active: created.active,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível criar procedimento.", details: String(error) },
      { status: 400 },
    );
  }
}
