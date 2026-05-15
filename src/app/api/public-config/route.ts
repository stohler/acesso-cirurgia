import { NextResponse } from "next/server";

function decodeBase64Key(value: string) {
  try {
    return Buffer.from(value, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

function resolvePublicKeyPem() {
  const rawKey = process.env.TRIAGE_RSA_PUBLIC_KEY_PEM ?? process.env.NEXT_PUBLIC_TRIAGE_RSA_PUBLIC_KEY_PEM;
  const base64Key =
    process.env.TRIAGE_RSA_PUBLIC_KEY_PEM_BASE64 ??
    process.env.NEXT_PUBLIC_TRIAGE_RSA_PUBLIC_KEY_PEM_BASE64;

  if (rawKey) {
    return rawKey.replace(/\\n/g, "\n").trim();
  }

  if (base64Key) {
    const decoded = decodeBase64Key(base64Key);
    return decoded?.trim() ?? null;
  }

  return null;
}

export async function GET() {
  const publicKeyPem = resolvePublicKeyPem();

  if (!publicKeyPem) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Chave pública da triagem não configurada no runtime (TRIAGE_RSA_PUBLIC_KEY_PEM ou NEXT_PUBLIC_TRIAGE_RSA_PUBLIC_KEY_PEM).",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      configured: true,
      publicKeyPem,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
