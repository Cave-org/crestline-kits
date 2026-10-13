// Shop filtering: reads filters from the URL, applies them, and counts options for each filter group.
// Pure functions, used on the server (filtering) and the client (building URLs).
import type { ShopItem } from "./catalog";

export const sortKeys = ["newest", "price-asc", "price-desc", "name"] as const;
export type SortKey = (typeof sortKeys)[number];

export const priceBuckets = [
  { id: "u300", label: "Under GH₵ 300", min: 0, max: 30000 },
  { id: "300-500", label: "GH₵ 300 – 500", min: 30000, max: 50000 },
  { id: "500-700", label: "GH₵ 500 – 700", min: 50000, max: 70000 },
  { id: "700", label: "GH₵ 700 and up", min: 70000, max: Infinity },
] as const;

export type Filters = {
  cat: string[];
  kit: string[];
  team: string[];
  size: string[];
  price: string[];
  stock: boolean;
  sale: boolean;
  isNew: boolean;
  q: string;
  sort: SortKey;
};

export type RawParams = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : [])
    .flatMap((x) => x.split(","))
    .map((x) => x.trim())
    .filter(Boolean);

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseFilters(params: RawParams, presetCategory?: string): Filters {
  const sort = one(params.sort) as SortKey;
  const cat = list(params.cat);
  if (presetCategory && !cat.includes(presetCategory)) cat.unshift(presetCategory);
  return {
    cat,
    kit: list(params.kit),
    team: list(params.team),
    size: list(params.size),
    price: list(params.price),
    stock: one(params.stock) === "1",
    sale: one(params.sale) === "1",
    isNew: one(params.new) === "1",
    q: one(params.q).trim(),
    sort: sortKeys.includes(sort) ? sort : "newest",
  };
}

export function filtersToQuery(f: Filters) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.cat.length) p.set("cat", f.cat.join(","));
  if (f.kit.length) p.set("kit", f.kit.join(","));
  if (f.team.length) p.set("team", f.team.join(","));
  if (f.size.length) p.set("size", f.size.join(","));
  if (f.price.length) p.set("price", f.price.join(","));
  if (f.stock) p.set("stock", "1");
  if (f.sale) p.set("sale", "1");
  if (f.isNew) p.set("new", "1");
  if (f.sort !== "newest") p.set("sort", f.sort);
  return p.toString();
}

export function activeCount(f: Filters) {
  return f.cat.length + f.kit.length + f.team.length + f.size.length + f.price.length + +f.stock + +f.sale + +f.isNew;
}

type Group = "cat" | "kit" | "team" | "size" | "price";

const onSale = (p: ShopItem) => !!p.compareAtPrice && p.compareAtPrice > p.price;

function matches(p: ShopItem, f: Filters, skip?: Group) {
  if (f.q) {
    const hay = `${p.name} ${p.team} ${p.season ?? ""} ${p.kitType} ${p.categoryName}`.toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  if (skip !== "cat" && f.cat.length && !f.cat.includes(p.categorySlug)) return false;
  if (skip !== "kit" && f.kit.length && !f.kit.includes(p.kitType)) return false;
  if (skip !== "team" && f.team.length && !f.team.includes(p.team)) return false;
  if (skip !== "size" && f.size.length && !f.size.some((s) => p.sizes.includes(s))) return false;
  if (skip !== "price" && f.price.length) {
    const ok = f.price.some((id) => {
      const b = priceBuckets.find((x) => x.id === id);
      return b ? p.price >= b.min && p.price < b.max : false;
    });
    if (!ok) return false;
  }
  if (f.stock && !p.inStock) return false;
  if (f.sale && !onSale(p)) return false;
  if (f.isNew && !p.isNew) return false;
  return true;
}

export function applyFilters(items: ShopItem[], f: Filters) {
  const out = items.filter((p) => matches(p, f));
  const by: Record<SortKey, (a: ShopItem, b: ShopItem) => number> = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return out.sort(by[f.sort]);
}

export type FacetOption = { value: string; label: string; count: number };
export type Facets = Record<Group, FacetOption[]> & { saleCount: number; stockCount: number };

/** Counts for each option, as if that one group were not filtered (so you can see what adding it would give). */
export function buildFacets(
  items: ShopItem[],
  f: Filters,
  categories: { slug: string; name: string }[],
  kitOrder: readonly string[],
  sizeOrder: readonly string[],
): Facets {
  const count = (group: Group, key: (p: ShopItem) => string | string[]) => {
    const m = new Map<string, number>();
    for (const p of items) {
      if (!matches(p, f, group)) continue;
      const k = key(p);
      for (const v of Array.isArray(k) ? k : [k]) m.set(v, (m.get(v) ?? 0) + 1);
    }
    return m;
  };
  const cat = count("cat", (p) => p.categorySlug);
  const kit = count("kit", (p) => p.kitType);
  const team = count("team", (p) => p.team);
  const size = count("size", (p) => p.sizes);
  const price = count("price", (p) => priceBuckets.find((b) => p.price >= b.min && p.price < b.max)?.id ?? "");

  const teams = [...new Set(items.map((p) => p.team))].sort((a, b) => a.localeCompare(b));
  const base = items.filter((p) => matches(p, { ...f, sale: false, stock: false }));

  return {
    cat: categories.map((c) => ({ value: c.slug, label: c.name, count: cat.get(c.slug) ?? 0 })),
    kit: kitOrder.filter((k) => items.some((p) => p.kitType === k)).map((k) => ({ value: k, label: k, count: kit.get(k) ?? 0 })),
    team: teams.map((t) => ({ value: t, label: t, count: team.get(t) ?? 0 })),
    size: sizeOrder.map((s) => ({ value: s, label: s, count: size.get(s) ?? 0 })),
    price: priceBuckets.map((b) => ({ value: b.id, label: b.label, count: price.get(b.id) ?? 0 })),
    saleCount: base.filter(onSale).length,
    stockCount: base.filter((p) => p.inStock).length,
  };
}
