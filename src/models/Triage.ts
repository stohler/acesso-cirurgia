import { model, models, Schema } from "mongoose";

const triageSchema = new Schema(
  {
    especialidadeSlug: { type: String, required: true, index: true },
    procedimentoSlug: { type: String, required: true, index: true },
    cidadeSlug: { type: String, required: true, index: true },
    consentimentoLgpd: {
      aceito: { type: Boolean, required: true },
      aceitoEm: { type: Date, required: true },
      versao: { type: String, required: true },
      ipHash: { type: String, required: false },
    },
    encryptedPayload: {
      algoritmo: { type: String, required: true },
      iv: { type: String, required: true },
      encryptedDataBase64: { type: String, required: true },
      encryptedSymmetricKeyBase64: { type: String, required: true },
    },
    attachment: {
      storageProvider: { type: String, required: true, default: "gcs" },
      objectPath: { type: String, required: true },
      originalFileName: { type: String, required: true },
      originalMimeType: { type: String, required: true },
      encryptedSizeBytes: { type: Number, required: true },
      encryption: {
        algoritmo: { type: String, required: true },
        iv: { type: String, required: true },
      },
    },
    status: {
      type: String,
      enum: ["novo", "em-analise", "contato-realizado", "encerrado"],
      default: "novo",
      index: true,
    },
    notasInternas: { type: String, required: false },
  },
  { timestamps: true },
);

triageSchema.index({ especialidadeSlug: 1, cidadeSlug: 1, status: 1 });

export const TriageModel = models.Triage ?? model("Triage", triageSchema);
