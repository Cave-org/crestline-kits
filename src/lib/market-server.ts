import "server-only";
import { cookies, headers } from "next/headers";
import { COUNTRY_COOKIE, currencyFor, normalizeCountry } from "./market";

/**
 * The visitor's country: the one they picked (saved in a cookie), otherwise the country
 * Vercel detects from their connection, otherwise Ghana.
 */
export async function getCountry() {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return normalizeCountry(c.get(COUNTRY_COOKIE)?.value || h.get("x-vercel-ip-country") || "GH");
}

export async function getMarket() {
  const country = await getCountry();
  return { country, currency: currencyFor(country) };
}
