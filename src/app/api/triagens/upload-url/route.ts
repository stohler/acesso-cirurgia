import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { createUploadSignedUrl } from "@/lib/gcs";

const bodySchema = z.object({
  originalFileName: z.string().min(3).max(180),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const objectPath = `triagens/${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${body.originalFileName.replace(/\s+/g, "-")}.enc`;

    try {
      const signedUrl = await createUploadSignedUrl(objectPath, 20);

      return NextResponse.json({
        signedUrl,
        objectPath,
        uploadMode: "signed-url",
      });
    } catch (error) {
      const normalizedError = String(error);
      const signingPermissionError = normalizedError.includes("iam.serviceAccounts.signBlob");

      if (signingPermissionError) {
        return NextResponse.json({
          signedUrl: `/api/triagens/upload-proxy?objectPath=${encodeURIComponent(objectPath)}`,
          objectPath,
          uploadMode: "proxy",
          warning:
            "Permissão signBlob indisponível; usando upload proxy seguro pelo backend.",
        });
      }

      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível gerar URL de upload.", details: String(error) },
      { status: 400 },
    );
  }
}
