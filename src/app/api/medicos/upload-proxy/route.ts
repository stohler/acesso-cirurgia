import { NextResponse } from "next/server";

import { uploadBinaryObject } from "@/lib/gcs";

function isAllowedObjectPath(value: string) {
  return /^medicos-cadastros\/\d{4}\/[a-zA-Z0-9_.-]+$/.test(value);
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const objectPath = url.searchParams.get("objectPath");

    if (!objectPath || !isAllowedObjectPath(objectPath)) {
      return NextResponse.json({ error: "objectPath inválido para upload." }, { status: 400 });
    }

    const payload = Buffer.from(await request.arrayBuffer());
    if (!payload.byteLength) {
      return NextResponse.json({ error: "Arquivo vazio." }, { status: 400 });
    }

    await uploadBinaryObject({
      objectPath,
      buffer: payload,
      contentType: request.headers.get("content-type") ?? "application/octet-stream",
    });

    return NextResponse.json({ ok: true, objectPath });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha no upload de documento via proxy.", details: String(error) },
      { status: 500 },
    );
  }
}
