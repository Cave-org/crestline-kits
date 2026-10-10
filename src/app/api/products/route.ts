import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/catalog";

export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
