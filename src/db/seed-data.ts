// Starter catalogue. Replace names, prices and photos with your real stock from the admin dashboard.
// Prices are in pesewas. Images point at generated placeholders in /public/products until you upload photos.

export type Pattern = "plain" | "stripes" | "hoops" | "halves" | "sash" | "pinstripe";

export type SeedProduct = {
  name: string;
  team: string;
  season: string;
  kitType: string;
  brand?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  featured?: boolean;
  isNew?: boolean;
  color: string;
  colors: { primary: string; secondary: string; trim: string };
  pattern: Pattern;
  stock: Record<string, number>;
};

export const categories = [
  { name: "National Teams", slug: "national-teams", blurb: "Back your nation with this season's international kits.", sortOrder: 1 },
  { name: "Club Jerseys", slug: "club-jerseys", blurb: "Home, away and third kits from the biggest clubs.", sortOrder: 2 },
  { name: "Retro Classics", slug: "retro", blurb: "Iconic shirts from legendary seasons.", sortOrder: 3 },
  { name: "Training & Sportswear", slug: "sportswear", blurb: "Training tops and everyday sportswear.", sortOrder: 4 },
];

const full = { S: 6, M: 10, L: 10, XL: 6, XXL: 3 };
const low = { S: 2, M: 3, L: 0, XL: 2, XXL: 1 };

export const products: SeedProduct[] = [
  { name: "Ghana 2026 Home Jersey", team: "Ghana", season: "2026", kitType: "Home", category: "national-teams", price: 55000, featured: true, color: "White", colors: { primary: "#f7f7f5", secondary: "#111111", trim: "#d4a017" }, pattern: "plain", stock: full },
  { name: "Ghana 2026 Away Jersey", team: "Ghana", season: "2026", kitType: "Away", category: "national-teams", price: 55000, featured: true, color: "Red", colors: { primary: "#c8102e", secondary: "#111111", trim: "#fcd116" }, pattern: "sash", stock: full },
  { name: "Nigeria 2026 Home Jersey", team: "Nigeria", season: "2026", kitType: "Home", category: "national-teams", price: 52000, featured: true, color: "Green", colors: { primary: "#0a8a4a", secondary: "#e8f5ec", trim: "#ffffff" }, pattern: "pinstripe", stock: full },
  { name: "Spain 2026 Home Jersey", team: "Spain", season: "2026", kitType: "Home", category: "national-teams", price: 60000, featured: true, color: "Red", colors: { primary: "#d0102a", secondary: "#1b2a6b", trim: "#f2c230" }, pattern: "pinstripe", stock: full },
  { name: "Argentina 2026 Home Jersey", team: "Argentina", season: "2026", kitType: "Home", category: "national-teams", price: 60000, color: "Sky blue", colors: { primary: "#ffffff", secondary: "#75b6e6", trim: "#111111" }, pattern: "stripes", stock: full },
  { name: "Brazil 2026 Home Jersey", team: "Brazil", season: "2026", kitType: "Home", category: "national-teams", price: 58000, color: "Yellow", colors: { primary: "#f7d417", secondary: "#0b8a3e", trim: "#0b8a3e" }, pattern: "plain", stock: low },
  { name: "Senegal 2026 Home Jersey", team: "Senegal", season: "2026", kitType: "Home", category: "national-teams", price: 52000, color: "White", colors: { primary: "#ffffff", secondary: "#00853f", trim: "#e31b23" }, pattern: "plain", stock: full },
  { name: "Japan 2026 Away Jersey", team: "Japan", season: "2026", kitType: "Away", category: "national-teams", price: 58000, color: "White", colors: { primary: "#fafafa", secondary: "#e2483d", trim: "#111111" }, pattern: "pinstripe", stock: full },

  { name: "Hearts of Oak 2025/26 Home Jersey", team: "Accra Hearts of Oak", season: "2025/26", kitType: "Home", category: "club-jerseys", price: 35000, featured: true, color: "Multicolour", colors: { primary: "#c8102e", secondary: "#f2c230", trim: "#1d3f8f" }, pattern: "hoops", stock: full },
  { name: "Asante Kotoko 2025/26 Home Jersey", team: "Asante Kotoko", season: "2025/26", kitType: "Home", category: "club-jerseys", price: 35000, featured: true, color: "Red", colors: { primary: "#d11a2a", secondary: "#ffffff", trim: "#ffffff" }, pattern: "plain", stock: full },
  { name: "Barcelona 2025/26 Home Jersey", team: "FC Barcelona", season: "2025/26", kitType: "Home", category: "club-jerseys", price: 65000, color: "Blue / Garnet", colors: { primary: "#1d3d8f", secondary: "#a50044", trim: "#f2c230" }, pattern: "halves", stock: full },
  { name: "Manchester United 2025/26 Away Jersey", team: "Manchester United", season: "2025/26", kitType: "Away", category: "club-jerseys", price: 65000, color: "White", colors: { primary: "#f5f5f2", secondary: "#111111", trim: "#da291c" }, pattern: "plain", stock: low },
  { name: "Real Madrid 2025/26 Home Jersey", team: "Real Madrid", season: "2025/26", kitType: "Home", category: "club-jerseys", price: 68000, color: "White", colors: { primary: "#ffffff", secondary: "#c9a227", trim: "#1a1a4b" }, pattern: "plain", stock: full },
  { name: "Chelsea 2025/26 Home Jersey", team: "Chelsea", season: "2025/26", kitType: "Home", category: "club-jerseys", price: 62000, color: "Blue", colors: { primary: "#034694", secondary: "#ffffff", trim: "#ffffff" }, pattern: "plain", stock: full },

  { name: "Ghana 2006 Retro Home Jersey", team: "Ghana", season: "2006", kitType: "Retro", category: "retro", price: 75000, compareAtPrice: 90000, featured: true, isNew: false, color: "White", colors: { primary: "#ffffff", secondary: "#c8102e", trim: "#fcd116" }, pattern: "sash", stock: low },
  { name: "AC Milan 2006/07 Retro Home Jersey", team: "AC Milan", season: "2006/07", kitType: "Retro", category: "retro", price: 85000, isNew: false, color: "Red / Black", colors: { primary: "#c8102e", secondary: "#111111", trim: "#ffffff" }, pattern: "stripes", stock: low },
  { name: "Brazil 2002 Retro Home Jersey", team: "Brazil", season: "2002", kitType: "Retro", category: "retro", price: 80000, compareAtPrice: 95000, isNew: false, color: "Yellow", colors: { primary: "#f7d417", secondary: "#0b8a3e", trim: "#1d3f8f" }, pattern: "plain", stock: full },
  { name: "Italy 2006 Retro Home Jersey", team: "Italy", season: "2006", kitType: "Retro", category: "retro", price: 80000, isNew: false, color: "Blue", colors: { primary: "#1f4fa3", secondary: "#ffffff", trim: "#ffffff" }, pattern: "plain", stock: full },

  { name: "Crestline Training Top", team: "Crestline", season: "2026", kitType: "Training", brand: "Crestline", category: "sportswear", price: 25000, color: "Black", colors: { primary: "#151515", secondary: "#d4a017", trim: "#d4a017" }, pattern: "sash", stock: full },
  { name: "Crestline Matchday Tee", team: "Crestline", season: "2026", kitType: "Training", brand: "Crestline", category: "sportswear", price: 18000, color: "Grey", colors: { primary: "#c9c9c4", secondary: "#151515", trim: "#151515" }, pattern: "plain", stock: full },
];
