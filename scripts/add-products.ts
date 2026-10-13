// Adds the October 2026 batch of 8 jerseys to the store.
// Run from the project folder:   npx tsx --env-file=.env scripts/add-products.ts
// Safe to run more than once: existing products (same slug) are updated, not duplicated.
// Photos live in public/products/new/ and go live when you push to GitHub.
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "../src/db/schema";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const STOCK_PER_SIZE = 3;
const RETRO = 18000; // GH₵ 180
const CURRENT = 15000; // GH₵ 150

type NewProduct = {
  slug: string;
  name: string;
  team: string;
  season: string | null;
  kitType: string;
  category: "club-jerseys" | "retro" | "national-teams";
  color: string;
  price: number;
  description: string;
};

const items: NewProduct[] = [
  {
    slug: "flamengo-home-jersey-fan-version",
    name: "Flamengo Home Jersey (Fan Version)",
    team: "Flamengo",
    season: null,
    kitType: "Home",
    category: "club-jerseys",
    color: "Red / Black",
    price: CURRENT,
    description:
      "Flamengo's famous red and black hoops with a classic folded collar and red-trimmed shoulders. A fan-version jersey in light, breathable fabric for matchday or everyday wear.",
  },
  {
    slug: "fc-barcelona-1992-95-retro-home-jersey-fan-version",
    name: "FC Barcelona 1992–95 Retro Home Jersey (Fan Version)",
    team: "FC Barcelona",
    season: "1992–95",
    kitType: "Retro",
    category: "retro",
    color: "Blue / Garnet",
    price: RETRO,
    description:
      "The early-90s Barça home shirt: bold blue and garnet stripes, a polo collar and taped sleeves. A fan-version retro jersey for collectors and everyday wear.",
  },
  {
    slug: "liverpool-1993-95-retro-home-jersey-fan-version",
    name: "Liverpool 1993–95 Retro Home Jersey (Fan Version)",
    team: "Liverpool",
    season: "1993–95",
    kitType: "Retro",
    category: "retro",
    color: "Red",
    price: RETRO,
    description:
      "Liverpool's mid-90s home kit with its white sash panels, pinstripes and green-and-white trim on the collar and cuffs. A fan-version retro jersey.",
  },
  {
    slug: "chelsea-2005-06-retro-away-jersey-fan-version",
    name: "Chelsea 2005/06 Retro Away Jersey (Fan Version)",
    team: "Chelsea",
    season: "2005/06",
    kitType: "Retro",
    category: "retro",
    color: "White / Blue",
    price: RETRO,
    description:
      "A clean white Chelsea away shirt with a twin blue centre stripe and blue ringer collar and cuffs, from the club's Umbro years. A fan-version retro jersey.",
  },
  {
    slug: "as-roma-1998-2000-retro-home-jersey-fan-version",
    name: "AS Roma 1998–2000 Retro Home Jersey (Fan Version)",
    team: "AS Roma",
    season: "1998–2000",
    kitType: "Retro",
    category: "retro",
    color: "Burgundy / Orange",
    price: RETRO,
    description:
      "Roma's late-90s home shirt in deep giallorosso burgundy with a bright orange collar and patterned shoulders. A fan-version retro jersey.",
  },
  {
    slug: "manchester-united-1998-99-retro-away-jersey-fan-version",
    name: "Manchester United 1998/99 Retro Away Jersey (Fan Version)",
    team: "Manchester United",
    season: "1998/99",
    kitType: "Retro",
    category: "retro",
    color: "Black",
    price: RETRO,
    description:
      "The black away shirt from United's treble-winning era, with a zip-neck collar and red-and-white taped shoulders. A fan-version retro jersey.",
  },
  {
    slug: "portugal-2016-retro-home-jersey-fan-version",
    name: "Portugal 2016 Retro Home Jersey (Fan Version)",
    team: "Portugal",
    season: "2016",
    kitType: "Retro",
    category: "retro",
    color: "Red / Green",
    price: RETRO,
    description:
      "Portugal's 2016 home shirt in rich red with darker raglan sleeves and green side panels, from the summer they won the Euros. A fan-version retro jersey.",
  },
  {
    slug: "real-madrid-1999-2000-retro-away-jersey-fan-version",
    name: "Real Madrid 1999/2000 Retro Away Jersey (Fan Version)",
    team: "Real Madrid",
    season: "1999/2000",
    kitType: "Retro",
    category: "retro",
    color: "Black / Gold",
    price: RETRO,
    description:
      "Real Madrid's black away shirt from the turn of the millennium, with gold three-stripe shoulders and a V-neck polo collar. A fan-version retro jersey.",
  },
];

const details = [
  "Fan version (not player-issue)",
  "Lightweight, breathable polyester",
  "Regular fit, so order your usual size",
  "Machine wash cold, inside out",
  "Do not iron over printing",
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing from .env");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const cats = Object.fromEntries((await db.select().from(schema.categories)).map((c) => [c.slug, c.id]));

  for (const p of items) {
    const categoryId = cats[p.category];
    if (!categoryId) throw new Error(`Category "${p.category}" not found. Run npm run db:seed first.`);
    const data = {
      name: p.name,
      team: p.team,
      season: p.season,
      kitType: p.kitType,
      brand: null,
      description: p.description,
      details,
      color: p.color,
      price: p.price,
      compareAtPrice: null,
      images: [`/products/new/${p.slug}.webp`],
      featured: false,
      isNew: true,
      active: true,
      allowCustomization: true,
      categoryId,
    };
    const existing = await db.query.products.findFirst({ where: eq(schema.products.slug, p.slug), columns: { id: true } });
    const [row] = existing
      ? await db.update(schema.products).set(data).where(eq(schema.products.id, existing.id)).returning()
      : await db.insert(schema.products).values({ slug: p.slug, ...data }).returning();

    for (const [i, size] of SIZES.entries()) {
      await db
        .insert(schema.productVariants)
        .values({ productId: row.id, size, stock: STOCK_PER_SIZE, sortOrder: i })
        .onConflictDoNothing(); // keeps your stock if you've already edited it in admin
    }
    console.log(`${existing ? "Updated" : "Added  "}  ${p.name}  ·  GH₵ ${(p.price / 100).toFixed(2)}`);
  }

  await pool.end();
  console.log(`\nDone: ${items.length} jerseys. They show on the live site after you push (photos) and within 5 minutes (cache).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
