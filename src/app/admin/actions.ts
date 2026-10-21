"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders, productVariants, products, promoCodes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { kitTypes, sizes } from "@/lib/config";
import { slugify, toPesewas } from "@/lib/format";

export type ActionState = { error?: string; ok?: string } | undefined;

function refreshStore() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

/* ---------------- Products ---------------- */

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3, "Give the product a name"),
  team: z.string().trim().min(2, "Enter the team"),
  season: z.string().trim().max(20).optional(),
  kitType: z.enum(kitTypes),
  brand: z.string().trim().max(40).optional(),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.string().refine((v) => toPesewas(v) > 0, "Enter a price"),
  compareAtPrice: z.string().optional(),
  priceUsd: z.string().optional(),
  compareAtPriceUsd: z.string().optional(),
  color: z.string().trim().max(40).optional(),
  description: z.string().trim().min(10, "Write a short description"),
  details: z.string().optional(),
  images: z.string().optional(),
});

export async function saveProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const images = (v.images ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("/") || s.startsWith("https://"));
  if (images.length === 0) return { error: "Add at least one product image" };

  const compareAt = v.compareAtPrice ? toPesewas(v.compareAtPrice) : 0;
  const priceUsd = v.priceUsd ? toPesewas(v.priceUsd) : 0; // same maths: dollars → cents
  const compareAtUsd = v.compareAtPriceUsd ? toPesewas(v.compareAtPriceUsd) : 0;
  const data = {
    name: v.name,
    team: v.team,
    season: v.season || null,
    kitType: v.kitType,
    brand: v.brand || null,
    categoryId: v.categoryId,
    price: toPesewas(v.price),
    compareAtPrice: compareAt > 0 ? compareAt : null,
    priceUsd: priceUsd > 0 ? priceUsd : null,
    compareAtPriceUsd: priceUsd > 0 && compareAtUsd > 0 ? compareAtUsd : null,
    color: v.color || null,
    description: v.description,
    details: (v.details ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    images,
    featured: formData.get("featured") === "on",
    isNew: formData.get("isNew") === "on",
    active: formData.get("active") === "on",
    allowCustomization: formData.get("allowCustomization") === "on",
  };

  // Unique slug from the name
  let slug = slugify(v.name);
  for (let n = 2; ; n++) {
    const clash = await db.query.products.findFirst({
      where: v.id ? and(eq(products.slug, slug), ne(products.id, v.id)) : eq(products.slug, slug),
      columns: { id: true },
    });
    if (!clash) break;
    slug = `${slugify(v.name)}-${n}`;
  }

  const productId = await db.transaction(async (tx) => {
    let id = v.id;
    if (id) {
      await tx.update(products).set({ ...data, slug }).where(eq(products.id, id));
    } else {
      const [created] = await tx.insert(products).values({ ...data, slug }).returning({ id: products.id });
      id = created.id;
    }
    for (const [i, size] of sizes.entries()) {
      const raw = formData.get(`stock_${size}`);
      const stock = Math.max(0, parseInt(String(raw ?? "0"), 10) || 0);
      await tx
        .insert(productVariants)
        .values({ productId: id, size, stock, sortOrder: i })
        .onConflictDoUpdate({
          target: [productVariants.productId, productVariants.size],
          set: { stock, sortOrder: i },
        });
    }
    return id;
  });

  refreshStore();
  if (!v.id) redirect(`/admin/products/${productId}?saved=1`);
  return { ok: "Saved" };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db.delete(products).where(eq(products.id, id));
  refreshStore();
  redirect("/admin/products");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const p = await db.query.products.findFirst({ where: eq(products.id, id), columns: { active: true } });
  if (p) await db.update(products).set({ active: !p.active }).where(eq(products.id, id));
  refreshStore();
}

/* ---------------- Orders ---------------- */

const statuses = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = z.enum(statuses).parse(formData.get("status"));
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin", "layout");
}

/* ---------------- Promo codes ---------------- */

const promoSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,20}$/, "Codes use 3–20 letters or numbers"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.string(),
  minSubtotal: z.string().optional(),
  maxUses: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function createPromo(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = promoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const value = v.type === "PERCENT" ? parseInt(v.value, 10) : toPesewas(v.value);
  if (!value || value < 1 || (v.type === "PERCENT" && value > 100)) return { error: "Enter a valid discount" };
  const exists = await db.query.promoCodes.findFirst({ where: eq(promoCodes.code, v.code) });
  if (exists) return { error: "That code already exists" };
  await db.insert(promoCodes).values({
    code: v.code,
    type: v.type,
    value,
    minSubtotal: v.minSubtotal ? toPesewas(v.minSubtotal) : 0,
    maxUses: v.maxUses ? parseInt(v.maxUses, 10) || null : null,
    expiresAt: v.expiresAt ? new Date(`${v.expiresAt}T23:59:59`) : null,
  });
  revalidatePath("/admin/promos");
  return { ok: `${v.code} created` };
}

export async function togglePromo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const p = await db.query.promoCodes.findFirst({ where: eq(promoCodes.id, id) });
  if (p) await db.update(promoCodes).set({ active: !p.active }).where(eq(promoCodes.id, id));
  revalidatePath("/admin/promos");
}

export async function deletePromo(formData: FormData) {
  await requireAdmin();
  await db.delete(promoCodes).where(eq(promoCodes.id, String(formData.get("id"))));
  revalidatePath("/admin/promos");
}
