import { model, models, Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    especialidades: [{ type: String, required: true }],
    regioes: [
      {
        cidadeSlug: { type: String, required: true },
        uf: { type: String, required: true },
      },
    ],
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const DoctorModel = models.Doctor ?? model("Doctor", doctorSchema);
