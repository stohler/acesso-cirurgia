import { NextResponse } from "next/server";

import { uploadEncryptedObject } from "@/lib/gcs";

function isValidObjectPath(value: string) {
  return /^triagens\/\d{4}\/[a-zA-Z0-9-_.]+\.enc$/.test(value);
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const objectPath = searchParams.get("objectPath");

    if (!objectPath || !isValidObjectPath(objectPath)) {
      return NextResponse.json({ error: "objectPath inválido." }, { status: 400 });
    }

    const encryptedBuffer = Buffer.from(await request.arrayBuffer());
    if (!encryptedBuffer.byteLength) {
      return NextResponse.json({ error: "Arquivo criptografado vazio." }, { status: 400 });
    }

    await uploadEncryptedObject({
      objectPath,
      buffer: encryptedBuffer,
      contentType: request.headers.get("content-type") ?? "application/octet-stream",
    });

    return NextResponse.json({ ok: true, objectPath });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha no upload criptografado via proxy.",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
