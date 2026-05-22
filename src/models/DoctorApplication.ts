import { model, models, Schema } from "mongoose";

const doctorProcedurePricingSchema = new Schema(
  {
    especialidadeSlug: { type: String, required: true, index: true },
    procedimentoSlug: { type: String, required: true, index: true },
    cidadeSlug: { type: String, required: true, index: true },
    cidadeNome: { type: String, required: true },
    uf: { type: String, required: true, index: true },
    enderecoProcedimento: { type: String, required: true },
    valorMedioPacote: { type: Number, required: true },
  },
  { _id: false },
);

const doctorApplicationSchema = new Schema(
  {
    nome: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    telefone: { type: String, required: true },
    crm: { type: String, required: true, index: true },
    crmUf: { type: String, required: true },
    rqe: { type: String, required: false },
    fotoObjectPath: { type: String, required: false },
    certidaoRegularidadeObjectPath: { type: String, required: true },
    miniBio: { type: String, required: false },
    procedimentosRealizados: [{ type: String, required: true }],
    procedurePricing: [doctorProcedurePricingSchema],
    status: {
      type: String,
      enum: ["pendente", "aprovado", "rejeitado"],
      default: "pendente",
      index: true,
    },
    activeForPublicListing: { type: Boolean, default: false, index: true },
    review: {
      reviewerDoctorId: { type: String, required: false },
      reviewedAt: { type: Date, required: false },
      notes: { type: String, required: false },
    },
  },
  { timestamps: true },
);

doctorApplicationSchema.index(
  { crm: 1, crmUf: 1 },
  { unique: true, partialFilterExpression: { crm: { $exists: true } } },
);

export const DoctorApplicationModel =
  models.DoctorApplication ?? model("DoctorApplication", doctorApplicationSchema);
