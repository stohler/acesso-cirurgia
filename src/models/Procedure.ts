import { model, models, Schema } from "mongoose";

const procedureSchema = new Schema(
  {
    slug: { type: String, required: true, index: true },
    especialidadeSlug: { type: String, required: true, index: true },
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

procedureSchema.index({ slug: 1, especialidadeSlug: 1 }, { unique: true });

export const ProcedureModel = models.Procedure ?? model("Procedure", procedureSchema);
