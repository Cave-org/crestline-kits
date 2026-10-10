// Generates plain placeholder jersey images (no crests or logos) for the starter catalogue.
// Run with: npm run placeholders
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { products, type SeedProduct } from "../src/db/seed-data";
import { slugify } from "../src/lib/format";

const SHIRT =
  "M140 78 L172 62 Q200 84 228 62 L260 78 L336 118 L312 182 L278 166 L278 344 Q200 356 122 344 L122 166 L88 182 L64 118 Z";

function pattern(p: SeedProduct) {
  const { secondary } = p.colors;
  switch (p.pattern) {
    case "stripes":
      return Array.from({ length: 6 }, (_, i) => `<rect x="${122 + i * 28}" y="40" width="14" height="330" fill="${secondary}"/>`).join("");
    case "pinstripe":
      return Array.from({ length: 9 }, (_, i) => `<rect x="${130 + i * 18}" y="40" width="2" height="330" fill="${secondary}" opacity=".55"/>`).join("");
    case "hoops":
      return Array.from({ length: 5 }, (_, i) => `<rect x="40" y="${110 + i * 50}" width="320" height="22" fill="${i % 2 ? secondary : p.colors.trim}"/>`).join("");
    case "halves":
      return `<rect x="200" y="40" width="160" height="330" fill="${secondary}"/>`;
    case "sash":
      return `<path d="M100 80 L150 60 L320 360 L270 380 Z" fill="${secondary}"/>`;
    default:
      return "";
  }
}

function shirt(p: SeedProduct, view: "front" | "back") {
  const { primary, trim, secondary } = p.colors;
  const back =
    view === "back"
      ? `<text x="200" y="280" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="110" fill="${secondary === primary ? trim : secondary}" opacity=".9">10</text>`
      : `<rect x="168" y="120" width="10" height="10" rx="2" fill="${trim}" opacity=".85"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
<defs><clipPath id="s"><path d="${SHIRT}"/></clipPath></defs>
<g filter="drop-shadow(0 6px 10px rgba(0,0,0,.12))">
<path d="${SHIRT}" fill="${primary}"/>
<g clip-path="url(#s)">${pattern(p)}
<rect x="40" y="168" width="60" height="8" fill="${trim}" transform="rotate(-24 70 172)"/>
<rect x="300" y="168" width="60" height="8" fill="${trim}" transform="rotate(24 330 172)"/>
</g>
<path d="${SHIRT}" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/>
<path d="M172 62 Q200 ${view === "front" ? 100 : 74} 228 62" fill="none" stroke="${trim}" stroke-width="7" stroke-linecap="round"/>
${back}
</g>
</svg>`;
}

const dir = join(process.cwd(), "public", "products");
mkdirSync(dir, { recursive: true });
for (const p of products) {
  const slug = slugify(p.name);
  writeFileSync(join(dir, `${slug}-front.svg`), shirt(p, "front"));
  writeFileSync(join(dir, `${slug}-back.svg`), shirt(p, "back"));
}
console.log(`Wrote ${products.length * 2} placeholder images to public/products`);
