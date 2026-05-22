import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { DoctorApplicationModel } from "@/models/DoctorApplication";

const pricingSchema = z.object({
  especialidadeSlug: z.string().min(2),
  procedimentoSlug: z.string().min(2),
  cidadeSlug: z.string().min(2),
  cidadeNome: z.string().min(2),
  uf: z.string().length(2),
  enderecoProcedimento: z.string().min(8),
  valorMedioPacote: z.number().positive(),
});

const bodySchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(8),
  crm: z.string().min(4),
  crmUf: z.string().length(2),
  rqe: z.string().optional(),
  miniBio: z.string().max(1200).optional(),
  fotoObjectPath: z.string().optional(),
  certidaoRegularidadeObjectPath: z.string().min(6),
  procedimentosRealizados: z.array(z.string().min(2)).min(1),
  procedurePricing: z.array(pricingSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    await connectToDatabase();

    const existing = await DoctorApplicationModel.findOne({
      crm: body.crm,
      crmUf: body.crmUf,
    }).lean();

    if (existing) {
      return NextResponse.json(
        { error: "Já existe cadastro pendente/aprovado para este CRM e UF." },
        { status: 409 },
      );
    }

    const created = await DoctorApplicationModel.create({
      ...body,
      crm: body.crm.toUpperCase().trim(),
      crmUf: body.crmUf.toUpperCase().trim(),
      status: "pendente",
      activeForPublicListing: false,
    });

    return NextResponse.json({
      ok: true,
      solicitacaoId: String(created._id),
      status: created.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível registrar cadastro médico.", details: String(error) },
      { status: 400 },
    );
  }
}
