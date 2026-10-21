import "server-only";
import { headers } from "next/headers";
import { currencyFor, ipCountryFrom } from "./market";

/** The visitor's country, detected by Vercel from their connection. Visitors can't change it. */
export async function getCountry() {
  return ipCountryFrom((await headers()).get("x-vercel-ip-country"));
}

export async function getMarket() {
  const country = await getCountry();
  return { country, currency: currencyFor(country) };
}
