import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import { DoctorModel } from "@/models/Doctor";

type BootstrapDoctorInput = {
  nome: string;
  email: string;
  password: string;
  forcePasswordSync?: boolean;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function ensureDoctorAccount(input: BootstrapDoctorInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = await DoctorModel.findOne({ email: normalizedEmail });

  if (!existing) {
    const passwordHash = await bcrypt.hash(input.password, 12);

    await DoctorModel.create({
      nome: input.nome,
      email: normalizedEmail,
      passwordHash,
      especialidades: ["cirurgia-geral"],
      regioes: [
        { cidadeSlug: "itapetininga", uf: "SP" },
        { cidadeSlug: "sorocaba", uf: "SP" },
      ],
      active: true,
    });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (!existing.active) {
    updates.active = true;
  }

  // Para o usuário inicial fixo solicitado, sincronizamos senha caso esteja divergente.
  if (input.forcePasswordSync) {
    const matches = await bcrypt.compare(input.password, existing.passwordHash);
    if (!matches) {
      updates.passwordHash = await bcrypt.hash(input.password, 12);
    }
  }

  if (Object.keys(updates).length > 0) {
    await DoctorModel.updateOne({ _id: existing._id }, { $set: updates });
  }
}

export async function ensureBootstrapDoctor() {
  await connectToDatabase();

  // Usuário inicial padrão solicitado.
  await ensureDoctorAccount({
    nome: "Dr. P. Stohler",
    email: "pstohler@gmail.com",
    password: "freedoom",
    forcePasswordSync: true,
  });

  const email = process.env.BOOTSTRAP_DOCTOR_EMAIL;
  const password = process.env.BOOTSTRAP_DOCTOR_PASSWORD;
  const nome = process.env.BOOTSTRAP_DOCTOR_NOME ?? "Médico Responsável";

  if (email && password) {
    await ensureDoctorAccount({
      nome,
      email,
      password,
      forcePasswordSync: false,
    });
  }
}
