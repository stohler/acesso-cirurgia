import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import { DoctorModel } from "@/models/Doctor";

export async function ensureBootstrapDoctor() {
  const email = process.env.BOOTSTRAP_DOCTOR_EMAIL;
  const password = process.env.BOOTSTRAP_DOCTOR_PASSWORD;
  const nome = process.env.BOOTSTRAP_DOCTOR_NOME ?? "Médico Responsável";

  if (!email || !password) {
    return;
  }

  await connectToDatabase();

  const existing = await DoctorModel.findOne({ email }).lean();
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await DoctorModel.create({
    nome,
    email,
    passwordHash,
    especialidades: ["cirurgia-geral"],
    regioes: [
      { cidadeSlug: "itapetininga", uf: "SP" },
      { cidadeSlug: "sorocaba", uf: "SP" },
    ],
    active: true,
  });
}
