// Seeds categories, the starter catalogue, a welcome promo code and the admin account.
// Run with: npm run db:seed   (safe to run more than once)
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { categories as seedCategories, products as seedProducts } from "./seed-data";
import { slugify } from "../lib/format";

const SIZES = ["S", "M", "L", "XL", "XXL"];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add your Postgres connection string to .env, then run `npm run db:seed` again.");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  for (const c of seedCategories) {
    await db.insert(schema.categories).values(c).onConflictDoUpdate({ target: schema.categories.slug, set: c });
  }
  const cats = Object.fromEntries((await db.select().from(schema.categories)).map((c) => [c.slug, c.id]));

  for (const p of seedProducts) {
    const slug = slugify(p.name);
    const data = {
      name: p.name,
      team: p.team,
      season: p.season,
      kitType: p.kitType,
      brand: p.brand ?? null,
      description: `The ${p.team} ${p.season} ${p.kitType.toLowerCase()} jersey in ${p.color.toLowerCase()}. Lightweight, breathable fabric built for matchday, whether you're in the stands or on the pitch.`,
      details: [
        "Lightweight, breathable polyester",
        "Moisture-wicking fabric",
        "Regular fit, so order your usual size",
        "Machine wash cold, inside out",
        "Do not iron over printing",
      ],
      color: p.color,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      images: [`/products/${slug}-front.svg`, `/products/${slug}-back.svg`],
      featured: p.featured ?? false,
      isNew: p.isNew ?? true,
      allowCustomization: p.kitType !== "Training",
      categoryId: cats[p.category],
    };
    const [product] = await db
      .insert(schema.products)
      .values({ slug, ...data })
      .onConflictDoUpdate({ target: schema.products.slug, set: data })
      .returning();
    for (const [i, size] of SIZES.entries()) {
      await db
        .insert(schema.productVariants)
        .values({ productId: product.id, size, sortOrder: i, stock: p.stock[size] ?? 0 })
        .onConflictDoNothing();
    }
  }

  await db
    .insert(schema.promoCodes)
    .values({ code: "WELCOME10", type: "PERCENT", value: 10 })
    .onConflictDoNothing();

  const email = (process.env.ADMIN_EMAIL || "admin@crestlinekits.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await db
      .insert(schema.users)
      .values({ email, name: "Store Admin", role: "ADMIN", passwordHash })
      .onConflictDoUpdate({ target: schema.users.email, set: { role: "ADMIN", passwordHash } });
    console.log(`Admin account ready: ${email}`);
  } else {
    console.log("ADMIN_PASSWORD not set, so the admin account was skipped.");
  }
  console.log(`Seeded ${seedCategories.length} categories and ${seedProducts.length} products.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
