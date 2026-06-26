import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { isSuperAdminEmail } from "@/lib/superadmin";
import { toSlug } from "@/lib/utils";
import { ProcedureModel } from "@/models/Procedure";
import { SpecialtyModel } from "@/models/Specialty";

const bodySchema = z.object({
  slug: z.string().min(2).optional(),
  nome: z.string().min(2).optional(),
  descricao: z.string().min(4).max(500).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isSuperAdminEmail(session.email)) {
    return NextResponse.json({ error: "Acesso permitido apenas para superadmin." }, { status: 403 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    const { id } = await params;
    await connectToDatabase();

    const current = await SpecialtyModel.findById(id).lean();
    if (!current) {
      return NextResponse.json({ error: "Especialidade não encontrada." }, { status: 404 });
    }

    if (body.slug && toSlug(body.slug) !== current.slug) {
      return NextResponse.json(
        { error: "Para preservar integridade de dados, a alteração de slug não é permitida." },
        { status: 400 },
      );
    }

    const updated = await SpecialtyModel.findByIdAndUpdate(
      id,
      {
        slug: current.slug,
        nome: body.nome?.trim() ?? current.nome,
        descricao: body.descricao?.trim() ?? current.descricao,
        active: body.active ?? current.active,
      },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Especialidade não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      specialty: {
        id: String(updated._id),
        slug: updated.slug,
        nome: updated.nome,
        descricao: updated.descricao,
        active: updated.active,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível atualizar especialidade.", details: String(error) },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isSuperAdminEmail(session.email)) {
    return NextResponse.json({ error: "Acesso permitido apenas para superadmin." }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  const specialty = await SpecialtyModel.findById(id).lean();
  if (!specialty) {
    return NextResponse.json({ error: "Especialidade não encontrada." }, { status: 404 });
  }

  const relatedProcedures = await ProcedureModel.countDocuments({ especialidadeSlug: specialty.slug });
  if (relatedProcedures > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir especialidade com procedimentos vinculados." },
      { status: 409 },
    );
  }

  await SpecialtyModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
