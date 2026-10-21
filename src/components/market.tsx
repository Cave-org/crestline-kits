"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { formatMoney } from "@/lib/format";
import { COUNTRY_COOKIE, currencyFor, priceFor, printingFee, type Currency, type Priceable } from "@/lib/market";
import { countryOptions } from "@/lib/countries";

type Ctx = { country: string; currency: Currency; setCountry: (code: string) => void };

const MarketCtx = createContext<Ctx>({ country: "GH", currency: "GHS", setCountry: () => {} });

export function MarketProvider({ country: initial, children }: { country: string; children: React.ReactNode }) {
  const router = useRouter();
  const [country, setLocal] = useState(initial);
  useEffect(() => setLocal(initial), [initial]);

  const setCountry = useCallback(
    (code: string) => {
      document.cookie = `${COUNTRY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
      const changed = currencyFor(code) !== currencyFor(country);
      setLocal(code);
      if (changed) router.refresh(); // re-render server parts (shop filters, notices) in the new currency
    },
    [router, country],
  );

  return <MarketCtx.Provider value={{ country, currency: currencyFor(country), setCountry }}>{children}</MarketCtx.Provider>;
}

export const useMarket = () => useContext(MarketCtx);

/** Prices and formatting for the visitor's currency. */
export function useMoney() {
  const { currency } = useMarket();
  return {
    currency,
    format: (amount: number) => formatMoney(amount, currency),
    price: (p: Priceable) => priceFor(p, currency),
    printing: printingFee(currency),
  };
}

/** A product's price with the "was" price struck through when it's on sale. */
export function Price({ product, size = "md" }: { product: Priceable; size?: "md" | "lg" }) {
  const { price, format } = useMoney();
  const { price: now, compareAt } = price(product);
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={size === "lg" ? "text-2xl font-semibold md:text-3xl" : undefined}>{format(now)}</span>
      {compareAt && (
        <span className={clsx("font-normal text-muted line-through", size === "lg" ? "text-base" : "text-xs")}>
          {format(compareAt)}
        </span>
      )}
    </span>
  );
}

/** Sale percentage for a product in the visitor's currency, or null. */
export function useSalePercent(product: Priceable) {
  const { price } = useMoney();
  const { price: now, compareAt } = price(product);
  return compareAt ? Math.round(100 - (now / compareAt) * 100) : null;
}

/** Plain money amount (GH₵ value converted for USD viewers). For fees and thresholds set in GH₵. */
export function Money({ ghs, usd }: { ghs: number; usd?: number }) {
  const { currency, format } = useMoney();
  return <>{format(currency === "GHS" ? ghs : (usd ?? priceFor({ price: ghs }, "USD").price))}</>;
}

/** "Ship to" country picker. Changing it switches the prices across the site. */
export function CountrySelect({ className, id, label = "Ship to" }: { className?: string; id?: string; label?: string }) {
  const { country, setCountry } = useMarket();
  return (
    <select
      id={id}
      aria-label={label}
      value={country}
      onChange={(e) => setCountry(e.target.value)}
      className={className}
    >
      {countryOptions.map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
