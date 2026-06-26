import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { ensureInitialCatalogSeed } from "@/lib/default-catalog-seed";
import { connectToDatabase } from "@/lib/mongodb";
import { isSuperAdminEmail } from "@/lib/superadmin";
import { toSlug } from "@/lib/utils";
import { SpecialtyModel } from "@/models/Specialty";

const bodySchema = z.object({
  slug: z.string().min(2).optional(),
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
  const specialties = await SpecialtyModel.find({}).sort({ nome: 1 }).lean();

  return NextResponse.json({
    specialties: specialties.map((specialty) => ({
      id: String(specialty._id),
      slug: specialty.slug,
      nome: specialty.nome,
      descricao: specialty.descricao,
      active: specialty.active,
      createdAt: specialty.createdAt,
      updatedAt: specialty.updatedAt,
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

    const slug = toSlug(body.slug || body.nome);
    const existing = await SpecialtyModel.findOne({ slug }).lean();
    if (existing) {
      return NextResponse.json({ error: "Já existe especialidade com este slug." }, { status: 409 });
    }

    const created = await SpecialtyModel.create({
      slug,
      nome: body.nome.trim(),
      descricao: body.descricao?.trim() || `Especialidade ${body.nome.trim()}.`,
      active: body.active ?? true,
    });

    return NextResponse.json(
      {
        ok: true,
        specialty: {
          id: String(created._id),
          slug: created.slug,
          nome: created.nome,
          descricao: created.descricao,
          active: created.active,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível criar especialidade.", details: String(error) },
      { status: 400 },
    );
  }
}
