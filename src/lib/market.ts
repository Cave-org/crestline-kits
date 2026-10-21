// Which prices a buyer sees. Used on both the server and in the browser.
//   Ghana and Nigeria  → GH₵ prices
//   Everywhere else    → US dollar prices (each jersey's own USD price, or a converted one)
import { store } from "./config";
import { countryCodes } from "./countries";

export type Currency = "GHS" | "USD";

export const COUNTRY_COOKIE = "ck_country";
export const LOCAL_COUNTRIES = ["GH", "NG"];

export function normalizeCountry(code?: string | null) {
  const c = (code ?? "").trim().toUpperCase();
  return countryCodes.includes(c) ? c : "GH";
}

export const currencyFor = (country: string): Currency => (LOCAL_COUNTRIES.includes(country) ? "GHS" : "USD");

/** GH₵ (pesewas) → US cents, rounded up to a whole dollar. */
export const ghsToUsd = (pesewas: number) => Math.ceil(pesewas / store.ghsPerUsd / 100) * 100;
/** US cents → pesewas (for comparing against GH₵ promo minimums). */
export const usdToGhs = (cents: number) => Math.round(cents * store.ghsPerUsd);

export type Priceable = {
  price: number;
  compareAtPrice?: number | null;
  priceUsd?: number | null;
  compareAtPriceUsd?: number | null;
};

/** The price (and "was" price, only when it's higher) in the given currency. */
export function priceFor(p: Priceable, currency: Currency): { price: number; compareAt: number | null } {
  const sale = (price: number, was?: number | null) => ({ price, compareAt: was && was > price ? was : null });
  if (currency === "GHS") return sale(p.price, p.compareAtPrice);
  if (p.priceUsd) return sale(p.priceUsd, p.compareAtPriceUsd);
  return sale(ghsToUsd(p.price), p.compareAtPrice ? ghsToUsd(p.compareAtPrice) : null);
}

export const printingFee = (currency: Currency) =>
  currency === "GHS" ? store.customizationFee : store.customizationFeeUsd;

/** Paystack payment options for each country. */
export function paymentChannels(country: string) {
  return country === "GH" ? ["mobile_money", "card"] : ["card"];
}
