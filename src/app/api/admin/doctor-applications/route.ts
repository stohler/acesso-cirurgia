import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { DoctorApplicationModel } from "@/models/DoctorApplication";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await connectToDatabase();

  const applications = await DoctorApplicationModel.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json({
    applications: applications.map((item) => ({
      id: String(item._id),
      nome: item.nome,
      email: item.email,
      telefone: item.telefone,
      crm: item.crm,
      crmUf: item.crmUf,
      status: item.status,
      activeForPublicListing: item.activeForPublicListing,
      procedimentosRealizados: item.procedimentosRealizados,
      procedurePricing: item.procedurePricing,
      certidaoRegularidadeObjectPath: item.certidaoRegularidadeObjectPath,
      fotoObjectPath: item.fotoObjectPath,
      createdAt: item.createdAt,
      review: item.review,
    })),
  });
}
