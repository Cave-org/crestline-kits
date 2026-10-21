import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool() {
  const url = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString: url,
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    // Neon puts the database to sleep when nobody visits for a while; waking it can take a few
    // seconds, so wait up to 15 s for a connection instead of failing early.
    connectionTimeoutMillis: 15_000,
    // Close idle connections before Neon drops them, so we never reuse a dead one.
    idleTimeoutMillis: 10_000,
    keepAlive: true,
  });
  if (!url) {
    // No error while the app is being built; only when a page actually needs the database.
    pool.connect = (() => {
      throw new Error(
        "DATABASE_URL is missing. Add your Postgres connection string to .env locally, or to Environment Variables in Vercel.",
      );
    }) as Pool["connect"];
  }
  return pool;
}

const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
