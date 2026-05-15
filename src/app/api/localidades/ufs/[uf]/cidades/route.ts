import { NextResponse } from "next/server";

import { toSlug } from "@/lib/utils";

type IbgeCity = {
  id: number;
  nome: string;
};

function sanitizeUf(uf: string) {
  return uf.trim().toUpperCase();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uf: string }> },
) {
  try {
    const { uf } = await params;
    const normalizedUf = sanitizeUf(uf);

    if (!/^[A-Z]{2}$/.test(normalizedUf)) {
      return NextResponse.json({ error: "UF inválida." }, { status: 400 });
    }

    const ibgeUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${normalizedUf}/municipios?orderBy=nome`;
    const response = await fetch(ibgeUrl, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      throw new Error(`Falha IBGE cidades ${normalizedUf}: ${response.status}`);
    }

    const data = (await response.json()) as IbgeCity[];

    return NextResponse.json({
      uf: normalizedUf,
      cidades: data.map((item) => ({
        slug: toSlug(item.nome),
        nome: item.nome,
      })),
      source: "ibge",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Não foi possível consultar cidades no momento.",
        details: String(error),
      },
      { status: 502 },
    );
  }
}
