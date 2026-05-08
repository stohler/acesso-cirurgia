import { model, models, Schema } from "mongoose";

const specialtySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const SpecialtyModel = models.Specialty ?? model("Specialty", specialtySchema);
