import { NextResponse } from "next/server";

import { toSlug } from "@/lib/utils";

type IbgeCidade = {
  nome: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uf: string }> },
) {
  try {
    const { uf } = await params;
    const normalizedUf = uf.toUpperCase().trim();

    if (!/^[A-Z]{2}$/.test(normalizedUf)) {
      return NextResponse.json({ error: "UF inválida." }, { status: 400 });
    }

    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${normalizedUf}/municipios?orderBy=nome`,
      {
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    );

    if (!response.ok) {
      throw new Error(`IBGE status ${response.status}`);
    }

    const data = (await response.json()) as IbgeCidade[];

    return NextResponse.json({
      source: "ibge",
      uf: normalizedUf,
      cidades: data.map((item) => ({
        slug: toSlug(item.nome),
        nome: item.nome,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Não foi possível carregar cidades no momento.",
        details: String(error),
      },
      { status: 502 },
    );
  }
}
