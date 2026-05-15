import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { createDownloadSignedUrl } from "@/lib/gcs";
import { TriageModel } from "@/models/Triage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const triagem = await TriageModel.findById(id).lean();

  if (!triagem) {
    return NextResponse.json({ error: "Triagem não encontrada." }, { status: 404 });
  }

  const signedUrl = await createDownloadSignedUrl(triagem.attachment.objectPath);

  return NextResponse.json({
    signedUrl,
    originalFileName: triagem.attachment.originalFileName,
    originalMimeType: triagem.attachment.originalMimeType,
    encryptionIv: triagem.attachment.encryption.iv,
    encryptedSymmetricKeyBase64: triagem.encryptedPayload.encryptedSymmetricKeyBase64,
  });
}
