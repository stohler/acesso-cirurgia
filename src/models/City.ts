import { model, models, Schema } from "mongoose";

const citySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nome: { type: String, required: true },
    uf: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const CityModel = models.City ?? model("City", citySchema);
