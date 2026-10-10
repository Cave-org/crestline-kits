import Link from "next/link";
import clsx from "clsx";
import { ProductCard } from "./product-card";
import { SortSelect } from "./sort-select";
import { getCategories, listProducts, type SortKey } from "@/lib/catalog";
import { kitTypes } from "@/lib/config";

export type ShopSearchParams = { q?: string; kit?: string; sort?: string; new?: string };

export async function ShopView({ category, searchParams }: { category?: string; searchParams: ShopSearchParams }) {
  const sort = (["newest", "price-asc", "price-desc", "name"].includes(searchParams.sort ?? "")
    ? searchParams.sort
    : "newest") as SortKey;
  const kit = kitTypes.includes(searchParams.kit as (typeof kitTypes)[number]) ? searchParams.kit : undefined;

  const [categories, products] = await Promise.all([
    getCategories(),
    listProducts({ category, q: searchParams.q, kit, sort, isNew: searchParams.new === "1" }),
  ]);
  const current = categories.find((c) => c.slug === category);
  const title = searchParams.q
    ? `Results for “${searchParams.q}”`
    : current?.name ?? (searchParams.new === "1" ? "New arrivals" : "All jerseys");

  const base = category ? `/shop/${category}` : "/shop";
  const qs = (next: Partial<ShopSearchParams>) => {
    const p = new URLSearchParams();
    const merged = { ...searchParams, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div className="container-x pt-8">
      <nav className="text-[13px] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link> / <Link href="/shop" className="hover:text-ink">Shop</Link>
        {current && <> / <span className="text-ink">{current.name}</span></>}
      </nav>
      <div className="mt-4 flex flex-col gap-2">
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        {current?.blurb && <p className="text-muted">{current.blurb}</p>}
      </div>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        <Link
          href={searchParams.q ? `/shop?q=${encodeURIComponent(searchParams.q)}` : "/shop"}
          className={clsx("shrink-0 rounded-full border px-4 py-1.5 text-[13px]", !category ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.slug}`}
            className={clsx("shrink-0 rounded-full border px-4 py-1.5 text-[13px]", c.slug === category ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          <Link href={qs({ kit: undefined })} className={clsx("shrink-0 rounded px-2.5 py-1 text-[13px]", !kit ? "bg-tile font-semibold" : "text-muted hover:text-ink")}>
            All kits
          </Link>
          {kitTypes.map((k) => (
            <Link key={k} href={qs({ kit: k })} className={clsx("shrink-0 rounded px-2.5 py-1 text-[13px]", kit === k ? "bg-tile font-semibold" : "text-muted hover:text-ink")}>
              {k}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <span>{products.length} {products.length === 1 ? "product" : "products"}</span>
          <SortSelect value={sort} />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-3xl">Nothing here yet</p>
          <p className="mt-2 text-muted">Try another team or browse everything.</p>
          <Link href="/shop" className="btn btn-primary mt-6">Browse all jerseys</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
