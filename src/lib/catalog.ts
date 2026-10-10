import "server-only";
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
  images: products.images,
  isNew: products.isNew,
  categorySlug: categories.slug,
  inStock: sql<boolean>`exists (select 1 from ${productVariants} v where v.product_id = ${products.id} and v.stock > 0)`,
};

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "name";

export async function listProducts(opts: {
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

export async function getProduct(slug: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.active, true)),
    with: {
      category: true,
      variants: { orderBy: asc(productVariants.sortOrder) },
    },
  });
  return product ?? null;
}

export async function getRelated(productId: string, categoryId: string, limit = 8) {
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
