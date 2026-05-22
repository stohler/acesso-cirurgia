import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { DoctorApplicationModel } from "@/models/DoctorApplication";

const bodySchema = z.object({
  status: z.enum(["aprovado", "rejeitado"]),
  notes: z.string().max(600).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = bodySchema.parse(await request.json());
    await connectToDatabase();

    const updated = await DoctorApplicationModel.findByIdAndUpdate(
      id,
      {
        status: body.status,
        activeForPublicListing: body.status === "aprovado",
        review: {
          reviewerDoctorId: session.doctorId,
          reviewedAt: new Date(),
          notes: body.notes,
        },
      },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      application: {
        id: String(updated._id),
        status: updated.status,
        activeForPublicListing: updated.activeForPublicListing,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível atualizar status da solicitação.", details: String(error) },
      { status: 400 },
    );
  }
}
