import { NextResponse } from "next/server";

import { getCatalogData } from "@/lib/catalog-service";

export async function GET() {
  const data = await getCatalogData();
  return NextResponse.json(data);
}
