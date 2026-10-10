import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

// Only complain when the app is actually running. The production build loads this
// file too, but never queries the database, so it shouldn't need DATABASE_URL.
if (!process.env.DATABASE_URL && process.env.NEXT_PHASE !== "phase-production-build") {
  throw new Error(
    "DATABASE_URL is missing. Add your Postgres connection string to .env (see .env.example) and restart `npm run dev`.",
  );
}

const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: process.env.NODE_ENV === "production" ? 5 : 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
