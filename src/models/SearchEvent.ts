import { model, models, Schema } from "mongoose";

const searchEventSchema = new Schema(
  {
    especialidadeSlug: { type: String, required: true, index: true },
    procedimentoSlug: { type: String, required: true, index: true },
    cidadeSlug: { type: String, required: true, index: true },
    cidadeNome: { type: String, required: true },
    uf: { type: String, required: true, index: true },
    hasPriceEstimate: { type: Boolean, required: true, index: true },
    doctorsFound: { type: Number, required: true, default: 0 },
    source: { type: String, required: true, default: "landing-route" },
    metadata: {
      userAgent: { type: String, required: false },
      ipHash: { type: String, required: false },
    },
  },
  { timestamps: true },
);

searchEventSchema.index({
  especialidadeSlug: 1,
  procedimentoSlug: 1,
  cidadeSlug: 1,
  createdAt: -1,
});

export const SearchEventModel =
  models.SearchEvent ?? model("SearchEvent", searchEventSchema);
