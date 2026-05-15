import { NextResponse } from "next/server";

type IbgeUf = {
  id: number;
  sigla: string;
  nome: string;
};

const IBGE_UFS_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";

export async function GET() {
  try {
    const response = await fetch(IBGE_UFS_URL, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      throw new Error(`Falha IBGE UFs: ${response.status}`);
    }

    const data = (await response.json()) as IbgeUf[];

    return NextResponse.json({
      ufs: data.map((item) => ({
        sigla: item.sigla,
        nome: item.nome,
      })),
      source: "ibge",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Não foi possível consultar estados no momento.",
        details: String(error),
      },
      { status: 502 },
    );
  }
}
