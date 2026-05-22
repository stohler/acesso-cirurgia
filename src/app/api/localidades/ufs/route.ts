import { NextResponse } from "next/server";

type IbgeUf = {
  sigla: string;
  nome: string;
};

export async function GET() {
  try {
    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
      {
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    );

    if (!response.ok) {
      throw new Error(`IBGE status ${response.status}`);
    }

    const data = (await response.json()) as IbgeUf[];

    return NextResponse.json({
      source: "ibge",
      ufs: data.map((item) => ({
        sigla: item.sigla,
        nome: item.nome,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Não foi possível carregar estados no momento.",
        details: String(error),
      },
      { status: 502 },
    );
  }
}
