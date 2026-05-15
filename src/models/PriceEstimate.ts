import { model, models, Schema } from "mongoose";

const priceEstimateSchema = new Schema(
  {
    especialidadeSlug: { type: String, required: true, index: true },
    procedimentoSlug: { type: String, required: true, index: true },
    cidadeSlug: { type: String, required: true, index: true },
    cidadeNome: { type: String, required: true },
    uf: { type: String, required: true },
    pacote: { type: String, required: true },
    precoMinimo: { type: Number, required: true },
    precoMaximo: { type: Number, required: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

priceEstimateSchema.index(
  { especialidadeSlug: 1, procedimentoSlug: 1, cidadeSlug: 1 },
  { unique: true },
);

export const PriceEstimateModel =
  models.PriceEstimate ?? model("PriceEstimate", priceEstimateSchema);
