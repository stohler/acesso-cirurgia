import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { ensureBootstrapDoctor } from "@/lib/bootstrap";
import { connectToDatabase } from "@/lib/mongodb";
import { DoctorModel } from "@/models/Doctor";

const bodySchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    await ensureBootstrapDoctor();
    await connectToDatabase();

    const doctor = await DoctorModel.findOne({
      email: body.email.toLowerCase().trim(),
      active: true,
    });

    if (!doctor) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(body.senha, doctor.passwordHash);

    if (!validPassword) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const token = await createSessionToken({
      doctorId: doctor.id,
      email: doctor.email,
      name: doctor.nome,
    });

    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível fazer login.", details: String(error) },
      { status: 400 },
    );
  }
}
