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
    const signedUrl = await createUploadSignedUrl(objectPath, 20);

    return NextResponse.json({ signedUrl, objectPath });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível gerar URL de upload.", details: String(error) },
      { status: 400 },
    );
  }
}
