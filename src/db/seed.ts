// Sets up a new database: store categories, a welcome promo code and the admin account.
// Products are added in the admin dashboard, with photos stored in Vercel Blob.
// Run with: npm run db:seed   (safe to run more than once; it never touches your products)
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { categories as seedCategories } from "./seed-data";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add your Postgres connection string to .env, then run `npm run db:seed` again.");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Only creates what's missing, so it never overwrites categories you've edited in the admin.
  for (const c of seedCategories) {
    await db.insert(schema.categories).values(c).onConflictDoNothing({ target: schema.categories.slug });
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
  console.log(`Checked ${seedCategories.length} categories and the WELCOME10 promo code.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
