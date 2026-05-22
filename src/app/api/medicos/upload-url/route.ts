import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { createUploadSignedUrl } from "@/lib/gcs";

const bodySchema = z.object({
  originalFileName: z.string().min(3).max(180),
  fileKind: z.enum(["foto", "certidao"]),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const sanitizedName = body.originalFileName.replace(/\s+/g, "-");
    const objectPath = `medicos-cadastros/${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${body.fileKind}-${sanitizedName}`;

    try {
      const signedUrl = await createUploadSignedUrl(objectPath, 20);

      return NextResponse.json({
        signedUrl,
        objectPath,
        uploadMode: "signed-url",
      });
    } catch (error) {
      const normalizedError = String(error);
      if (normalizedError.includes("iam.serviceAccounts.signBlob")) {
        return NextResponse.json({
          signedUrl: `/api/medicos/upload-proxy?objectPath=${encodeURIComponent(objectPath)}`,
          objectPath,
          uploadMode: "proxy",
          warning:
            "Permissão signBlob indisponível na service account. Usando upload proxy pelo backend.",
        });
      }

      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível gerar URL para upload do documento.", details: String(error) },
      { status: 400 },
    );
  }
}
