import Link from "next/link";
import { ProductCard } from "./product-card";
import { ActiveChips, FilterPanel, MobileFilters, ResultsArea, ShopShell, SortMenu } from "./shop-filters";
import { getCategories, getShopIndex } from "@/lib/catalog";
import { kitTypes, sizes } from "@/lib/config";
import { applyFilters, buildFacets, parseFilters, priceBuckets, type RawParams } from "@/lib/shop-filters";
import { getMarket } from "@/lib/market-server";

export type ShopSearchParams = RawParams;

export async function ShopView({ category, searchParams }: { category?: string; searchParams: ShopSearchParams }) {
  const [categories, index, { currency }] = await Promise.all([getCategories(), getShopIndex(), getMarket()]);
  const filters = parseFilters(searchParams, category);
  // Price ranges from the other currency don't apply, so ignore them
  const known = new Set(priceBuckets[currency].map((b) => b.id));
  filters.price = filters.price.filter((id) => known.has(id));
  const results = applyFilters(index, filters, currency);
  const facets = buildFacets(index, filters, categories, kitTypes, sizes, currency);

  const only = filters.cat.length === 1 ? categories.find((c) => c.slug === filters.cat[0]) : undefined;
  const title = filters.q
    ? `Results for “${filters.q}”`
    : filters.cat.length === 1 && only
      ? only.name
      : filters.isNew
        ? "New arrivals"
        : filters.sale
          ? "On sale"
          : "All jerseys";

  return (
    <ShopShell initial={filters}>
      <div className="container-x pt-8">
        <nav className="text-[13px] text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link> / <Link href="/shop" className="hover:text-ink">Shop</Link>
          {only && filters.cat.length === 1 && <> / <span className="text-ink">{only.name}</span></>}
        </nav>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
          {only?.blurb && filters.cat.length === 1 && <p className="text-muted">{only.blurb}</p>}
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 pr-2">
              <FilterPanel facets={facets} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center gap-3">
                <MobileFilters facets={facets} resultCount={results.length} />
                <span className="text-[13px] text-muted" aria-live="polite">
                  {results.length} {results.length === 1 ? "jersey" : "jerseys"}
                </span>
              </div>
              <SortMenu />
            </div>

            <div className="mt-4">
              <ActiveChips facets={facets} />
            </div>

            <ResultsArea>
              {results.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="font-display text-3xl">No jerseys match</p>
                  <p className="mt-2 text-muted">Try removing a filter or two.</p>
                  <Link href="/shop" className="btn btn-primary mt-6">See all jerseys</Link>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4 lg:gap-x-5">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </ResultsArea>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
