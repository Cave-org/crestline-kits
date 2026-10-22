import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productVariants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { sizes } from "@/lib/config";

// Downloads every product with its stock per size as a spreadsheet (CSV), e.g. for Paystack's review.
export async function GET() {
  const session = await getSession();
  if (session?.role !== "ADMIN") return new Response("Not allowed", { status: 403 });

  const rows = await db.query.products.findMany({
    orderBy: asc(products.name),
    with: { category: { columns: { name: true } }, variants: { orderBy: asc(productVariants.sortOrder) } },
  });

  const cell = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["Product", "Team", "Season", "Kit", "Category", "Price (GHS)", ...sizes, "Total in stock", "Visible in store"];
  const lines = rows.map((p) => {
    const bySize = Object.fromEntries(p.variants.map((v) => [v.size, v.stock]));
    const total = p.variants.reduce((n, v) => n + v.stock, 0);
    return [
      p.name,
      p.team,
      p.season,
      p.kitType,
      p.category.name,
      (p.price / 100).toFixed(2),
      ...sizes.map((s) => bySize[s] ?? 0),
      total,
      p.active ? "Yes" : "No",
    ]
      .map(cell)
      .join(",");
  });

  const date = new Date().toISOString().slice(0, 10);
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="crestline-stock-${date}.csv"`,
    },
  });
}
