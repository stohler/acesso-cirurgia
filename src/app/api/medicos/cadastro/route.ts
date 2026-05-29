import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { toSlug } from "@/lib/utils";
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

const addressProcedureSchema = z.object({
  especialidadeSlug: z.string().min(2),
  procedimentoSlug: z.string().min(2),
  valorMedioPacote: z.number().positive(),
});

const practiceAddressSchema = z.object({
  uf: z.string().length(2),
  cidadeSlug: z.string().min(2),
  cidadeNome: z.string().min(2),
  enderecoProcedimento: z.string().min(8),
  procedures: z.array(addressProcedureSchema).min(1),
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
  procedimentosRealizados: z.array(z.string().min(2)).min(1).optional(),
  practiceAddresses: z.array(practiceAddressSchema).min(1).optional(),
  procedurePricing: z.array(pricingSchema).min(1).optional(),
}).superRefine((value, ctx) => {
  if ((!value.practiceAddresses || value.practiceAddresses.length === 0) && (!value.procedurePricing || value.procedurePricing.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["practiceAddresses"],
      message: "Informe ao menos um endereço com procedimentos ou linhas de precificação.",
    });
  }
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    await connectToDatabase();
    const normalizedCrm = body.crm.toUpperCase().trim();
    const normalizedCrmUf = body.crmUf.toUpperCase().trim();

    const normalizedPracticeAddresses = (body.practiceAddresses ?? []).map((address) => ({
      uf: address.uf.toUpperCase().trim(),
      cidadeSlug: toSlug(address.cidadeSlug),
      cidadeNome: address.cidadeNome.trim(),
      enderecoProcedimento: address.enderecoProcedimento.trim(),
      procedures: address.procedures.map((procedure) => ({
        especialidadeSlug: procedure.especialidadeSlug.trim().toLowerCase(),
        procedimentoSlug: procedure.procedimentoSlug.trim().toLowerCase(),
        valorMedioPacote: Number(procedure.valorMedioPacote),
      })),
    }));

    const pricingFromAddresses = normalizedPracticeAddresses.flatMap((address) =>
      address.procedures.map((procedure) => ({
        especialidadeSlug: procedure.especialidadeSlug,
        procedimentoSlug: procedure.procedimentoSlug,
        cidadeSlug: address.cidadeSlug,
        cidadeNome: address.cidadeNome,
        uf: address.uf,
        enderecoProcedimento: address.enderecoProcedimento,
        valorMedioPacote: procedure.valorMedioPacote,
      })),
    );

    const normalizedLegacyPricing = (body.procedurePricing ?? []).map((row) => ({
      especialidadeSlug: row.especialidadeSlug.trim().toLowerCase(),
      procedimentoSlug: row.procedimentoSlug.trim().toLowerCase(),
      cidadeSlug: toSlug(row.cidadeSlug || row.cidadeNome),
      cidadeNome: row.cidadeNome.trim(),
      uf: row.uf.toUpperCase().trim(),
      enderecoProcedimento: row.enderecoProcedimento.trim(),
      valorMedioPacote: Number(row.valorMedioPacote),
    }));

    const normalizedProcedurePricing = pricingFromAddresses.length > 0
      ? pricingFromAddresses
      : normalizedLegacyPricing;

    if (normalizedProcedurePricing.length === 0) {
      return NextResponse.json(
        { error: "Informe ao menos um procedimento com endereço e valor médio do pacote." },
        { status: 400 },
      );
    }

    const normalizedProcedimentosRealizados = [
      ...new Set(
        (body.procedimentosRealizados?.length
          ? body.procedimentosRealizados
          : normalizedProcedurePricing.map((item) => item.procedimentoSlug)
        ).map((item) => item.trim().toLowerCase()),
      ),
    ];

    const existing = await DoctorApplicationModel.findOne({
      crm: normalizedCrm,
      crmUf: normalizedCrmUf,
    }).lean();

    if (existing) {
      return NextResponse.json(
        { error: "Já existe cadastro pendente/aprovado para este CRM e UF." },
        { status: 409 },
      );
    }

    const created = await DoctorApplicationModel.create({
      nome: body.nome.trim(),
      email: body.email.trim().toLowerCase(),
      telefone: body.telefone.trim(),
      crm: normalizedCrm,
      crmUf: normalizedCrmUf,
      rqe: body.rqe?.trim() || undefined,
      miniBio: body.miniBio?.trim() || undefined,
      fotoObjectPath: body.fotoObjectPath,
      certidaoRegularidadeObjectPath: body.certidaoRegularidadeObjectPath,
      procedimentosRealizados: normalizedProcedimentosRealizados,
      practiceAddresses: normalizedPracticeAddresses,
      procedurePricing: normalizedProcedurePricing,
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
