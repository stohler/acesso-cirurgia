import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { withMongoTransaction } from "@/lib/mongodb";
import { TriageModel } from "@/models/Triage";

const triageCreateSchema = z.object({
  especialidadeSlug: z.string().min(2),
  procedimentoSlug: z.string().min(2),
  cidadeSlug: z.string().min(2),
  doctorReferral: z
    .object({
      doctorApplicationId: z.string().min(3),
      doctorName: z.string().min(3),
    })
    .optional(),
  consentimentoLgpd: z.object({
    aceito: z.literal(true),
    versao: z.string().min(2),
  }),
  encryptedPayload: z.object({
    algoritmo: z.literal("AES-256-GCM + RSA-OAEP-256"),
    iv: z.string().min(8),
    encryptedDataBase64: z.string().min(16),
    encryptedSymmetricKeyBase64: z.string().min(16),
  }),
  attachment: z.object({
    objectPath: z.string().min(4),
    originalFileName: z.string().min(3),
    originalMimeType: z.string().min(3),
    encryptedSizeBytes: z.number().positive(),
    encryption: z.object({
      algoritmo: z.literal("AES-256-GCM"),
      iv: z.string().min(8),
    }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = triageCreateSchema.parse(await request.json());

    const triage = await withMongoTransaction(async (session) => {
      const [created] = await TriageModel.create(
        [
          {
            especialidadeSlug: body.especialidadeSlug,
            procedimentoSlug: body.procedimentoSlug,
            cidadeSlug: body.cidadeSlug,
            doctorReferral: body.doctorReferral,
            consentimentoLgpd: {
              aceito: true,
              aceitoEm: new Date(),
              versao: body.consentimentoLgpd.versao,
              ipHash: crypto
                .createHash("sha256")
                .update(request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "no-ip")
                .digest("hex"),
            },
            encryptedPayload: body.encryptedPayload,
            attachment: {
              storageProvider: "gcs",
              objectPath: body.attachment.objectPath,
              originalFileName: body.attachment.originalFileName,
              originalMimeType: body.attachment.originalMimeType,
              encryptedSizeBytes: body.attachment.encryptedSizeBytes,
              encryption: body.attachment.encryption,
            },
            status: "novo",
          },
        ],
        { session },
      );

      return created;
    });

    return NextResponse.json({
      ok: true,
      triagemId: triage.id,
      protocolo: `ASC-${triage.id.slice(-8).toUpperCase()}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível registrar a triagem.", details: String(error) },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const especialidade = request.nextUrl.searchParams.get("especialidade");
  const cidade = request.nextUrl.searchParams.get("cidade");
  const status = request.nextUrl.searchParams.get("status");

  const query: Record<string, string> = {};

  if (especialidade) {
    query.especialidadeSlug = especialidade;
  }

  if (cidade) {
    query.cidadeSlug = cidade;
  }

  if (status) {
    query.status = status;
  }

  const triagens = await TriageModel.find(query).sort({ createdAt: -1 }).limit(120).lean();

  return NextResponse.json({
    triagens: triagens.map((triagem) => ({
      id: String(triagem._id),
      especialidadeSlug: triagem.especialidadeSlug,
      procedimentoSlug: triagem.procedimentoSlug,
      cidadeSlug: triagem.cidadeSlug,
      doctorReferral: triagem.doctorReferral,
      status: triagem.status,
      createdAt: triagem.createdAt,
      encryptedPayload: triagem.encryptedPayload,
      attachment: triagem.attachment,
    })),
  });
}
