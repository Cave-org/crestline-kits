import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { products, productVariants } from "@/db/schema";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { toggleProductActive } from "../actions";

export const metadata = { title: "Products" };

export default async function AdminProducts() {
  const list = await db.query.products.findMany({
    orderBy: asc(products.name),
    with: { category: { columns: { name: true } }, variants: { orderBy: asc(productVariants.sortOrder) } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary !py-2.5">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock (S · M · L · XL · XXL)</th>
              <th className="px-5 py-3 font-medium">Visible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => {
              const total = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-tile/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <ProductImage src={p.images[0]} alt="" sizes="48px" className="h-12 w-12 shrink-0 rounded" />
                      <span className="font-medium hover:underline">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{p.category.name}</td>
                  <td className="px-5 py-3">{formatMoney(p.price)}</td>
                  <td className="px-5 py-3 tabular-nums">
                    <span className={total === 0 ? "font-semibold text-sale" : ""}>{total}</span>
                    <span className="ml-2 text-[12px] text-muted">{p.variants.map((v) => v.stock).join(" · ")}</span>
                  </td>
                  <td className="px-5 py-3">
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${p.active ? "bg-ok/10 text-ok" : "bg-tile text-muted"}`}
                        title="Click to toggle"
                      >
                        {p.active ? "Live" : "Hidden"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
