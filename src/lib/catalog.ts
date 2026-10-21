import "server-only";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "./db";
import { categories, productVariants, products } from "@/db/schema";

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  team: string;
  kitType: string;
  price: number;
  compareAtPrice: number | null;
  priceUsd: number | null;
  compareAtPriceUsd: number | null;
  images: string[];
  isNew: boolean;
  inStock: boolean;
  categorySlug: string;
};

const cardColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  team: products.team,
  kitType: products.kitType,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  priceUsd: products.priceUsd,
  compareAtPriceUsd: products.compareAtPriceUsd,
  images: products.images,
  isNew: products.isNew,
  categorySlug: categories.slug,
  inStock: sql<boolean>`exists (select 1 from ${productVariants} v where v.product_id = ${products.id} and v.stock > 0)`,
};

async function getCategoriesRaw() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "name";

async function listProductsRaw(opts: {
  category?: string;
  q?: string;
  kit?: string;
  sort?: SortKey;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
} = {}): Promise<ProductCard[]> {
  const where: SQL[] = [eq(products.active, true)];
  if (opts.category) where.push(eq(categories.slug, opts.category));
  if (opts.kit) where.push(eq(products.kitType, opts.kit));
  if (opts.featured) where.push(eq(products.featured, true));
  if (opts.isNew) where.push(eq(products.isNew, true));
  if (opts.q?.trim()) {
    const term = `%${opts.q.trim()}%`;
    where.push(or(ilike(products.name, term), ilike(products.team, term), ilike(products.season, term))!);
  }
  const order =
    opts.sort === "price-asc"
      ? [asc(products.price)]
      : opts.sort === "price-desc"
        ? [desc(products.price)]
        : opts.sort === "name"
          ? [asc(products.name)]
          : [desc(products.createdAt), asc(products.name)];

  const rows = await db
    .select(cardColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...where))
    .orderBy(...order)
    .limit(opts.limit ?? 200);
  return rows;
}

async function getProductRaw(slug: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.active, true)),
    with: {
      category: true,
      variants: { orderBy: asc(productVariants.sortOrder) },
    },
  });
  return product ?? null;
}

async function getRelatedRaw(productId: string, categoryId: string, limit = 8) {
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.active, true), eq(products.categoryId, categoryId), ne(products.id, productId)))
    .orderBy(desc(products.featured), asc(products.name))
    .limit(limit);
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.active, true), inArray(products.id, ids)));
}


/** Everything the shop filters need, in one small query. The catalogue is small, so filtering happens in memory. */
export type ShopItem = ProductCard & {
  categoryName: string;
  season: string | null;
  createdAt: string;
  sizes: string[]; // sizes currently in stock
};

async function getShopIndexRaw(): Promise<ShopItem[]> {
  const rows = await db
    .select({
      ...cardColumns,
      categoryName: categories.name,
      season: products.season,
      createdAt: products.createdAt,
      sizes: sql<string[]>`coalesce(array(select v.size from ${productVariants} v where v.product_id = ${products.id} and v.stock > 0 order by v.sort_order), '{}')`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.active, true))
    .orderBy(desc(products.createdAt), asc(products.name));
  return rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt).toISOString() }));
}

/*
 * Cached versions. The catalogue is read from memory instead of the database on every
 * page view, which makes pages much faster when the database is far away.
 * The cache is cleared whenever the admin saves a product or an order is paid
 * (revalidateTag(CATALOG_TAG)), and refreshes on its own every 5 minutes as a fallback.
 */
export const CATALOG_TAG = "catalog";
const opts = { tags: [CATALOG_TAG], revalidate: 300 };

export const getCategories = unstable_cache(getCategoriesRaw, ["categories"], opts);
export const listProducts = unstable_cache(
  (o: Parameters<typeof listProductsRaw>[0] = {}) => listProductsRaw(o),
  ["list-products"],
  opts,
);
export const getProduct = unstable_cache(getProductRaw, ["product"], opts);
export const getRelated = unstable_cache(getRelatedRaw, ["related"], opts);
export const getShopIndex = unstable_cache(getShopIndexRaw, ["shop-index"], opts);
