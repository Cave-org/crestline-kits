import Link from "next/link";
import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { categories, products, productVariants } from "@/db/schema";
import { formatMoney } from "@/lib/format";
import { kitTypes } from "@/lib/config";
import { ProductImage } from "@/components/product-image";
import { toggleProductActive } from "../actions";
import { AdminProductFilters, type StatusCounts } from "./filters";

export const metadata = { title: "Products" };

const LOW_STOCK = 3; // a product with this many shirts or fewer left (in total) counts as low stock

type Params = { q?: string; cat?: string; kit?: string; status?: string; sort?: string };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const [all, cats] = await Promise.all([
    db.query.products.findMany({
      orderBy: asc(products.name),
      with: { category: { columns: { name: true, slug: true } }, variants: { orderBy: asc(productVariants.sortOrder) } },
    }),
    db.select({ slug: categories.slug, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
  ]);

  const rows = all.map((p) => ({ ...p, total: p.variants.reduce((n, v) => n + v.stock, 0) }));
  type Row = (typeof rows)[number];

  // Search, category and kit narrow the list first; the status tabs show counts within that
  const q = sp.q?.trim().toLowerCase() ?? "";
  const narrowed = rows.filter(
    (p) =>
      (!q || `${p.name} ${p.team} ${p.season ?? ""}`.toLowerCase().includes(q)) &&
      (!sp.cat || p.category.slug === sp.cat) &&
      (!sp.kit || p.kitType === sp.kit),
  );

  const statusTest: Record<keyof StatusCounts, (p: Row) => boolean> = {
    all: () => true,
    live: (p) => p.active,
    hidden: (p) => !p.active,
    low: (p) => p.total > 0 && p.total <= LOW_STOCK,
    out: (p) => p.total === 0,
    featured: (p) => p.featured,
    sale: (p) => !!p.compareAtPrice && p.compareAtPrice > p.price,
  };
  const counts = Object.fromEntries(
    Object.entries(statusTest).map(([k, fn]) => [k, narrowed.filter(fn).length]),
  ) as StatusCounts;

  const status = (sp.status && sp.status in statusTest ? sp.status : "all") as keyof StatusCounts;
  const sorters: Record<string, (a: Row, b: Row) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    newest: (a, b) => +b.createdAt - +a.createdAt,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "stock-asc": (a, b) => a.total - b.total,
    "stock-desc": (a, b) => b.total - a.total,
  };
  const list = narrowed.filter(statusTest[status]).sort(sorters[sp.sort ?? "name"] ?? sorters.name);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-0.5 text-sm text-muted">
            Showing {list.length} of {rows.length}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary !py-2.5">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <Suspense>
        <AdminProductFilters categories={cats} kits={[...kitTypes]} counts={counts}>
          <div className="mt-4 overflow-x-auto rounded-xl bg-white">
            {list.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted">No products match these filters.</p>
            ) : (
              <>
              {/* Phones: card list */}
              <ul className="divide-y divide-line md:hidden">
                {list.map((p) => (
                  <li key={p.id} className="flex gap-3 p-4">
                    <Link href={`/admin/products/${p.id}`} className="shrink-0">
                      <ProductImage src={p.images[0]} alt="" sizes="64px" className="h-16 w-16 rounded" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/products/${p.id}`} className="block font-medium leading-snug">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {p.category.name} · {p.kitType}
                        {p.featured && " · Featured"}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm">
                          {formatMoney(p.price)}
                          <span
                            className={`ml-2 text-[12px] ${p.total === 0 ? "font-semibold text-sale" : p.total <= LOW_STOCK ? "font-semibold text-accent" : "text-muted"}`}
                          >
                            {p.total === 0 ? "Sold out" : `${p.total} in stock`}
                          </span>
                        </span>
                        <form action={toggleProductActive}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${p.active ? "bg-ok/10 text-ok" : "bg-tile text-muted"}`}>
                            {p.active ? "Live" : "Hidden"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablets and desktop: table */}
              <table className="hidden w-full min-w-[760px] text-left text-sm md:table">
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
                  {list.map((p) => (
                    <tr key={p.id} className="hover:bg-tile/60">
                      <td className="px-5 py-3">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          <ProductImage src={p.images[0]} alt="" sizes="48px" className="h-12 w-12 shrink-0 rounded" />
                          <span>
                            <span className="font-medium hover:underline">{p.name}</span>
                            <span className="mt-0.5 block text-[12px] text-muted">
                              {p.kitType}
                              {p.featured && " · Featured"}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted">{p.category.name}</td>
                      <td className="px-5 py-3">
                        {formatMoney(p.price)}
                        {p.compareAtPrice && p.compareAtPrice > p.price && (
                          <span className="ml-1.5 text-[12px] text-muted line-through">{formatMoney(p.compareAtPrice)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 tabular-nums">
                        <span className={p.total === 0 ? "font-semibold text-sale" : p.total <= LOW_STOCK ? "font-semibold text-accent" : ""}>
                          {p.total === 0 ? "Sold out" : p.total}
                        </span>
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
                  ))}
                </tbody>
              </table>
              </>
            )}
          </div>
        </AdminProductFilters>
      </Suspense>
    </div>
  );
}
