"use client";

import { createContext, useContext } from "react";
import clsx from "clsx";
import { formatMoney } from "@/lib/format";
import { currencyFor, priceFor, printingFee, type Currency, type Priceable } from "@/lib/market";

type Ctx = { country: string; currency: Currency };

const MarketCtx = createContext<Ctx>({ country: "GH", currency: "GHS" });

/** country = where the visitor is, detected from their connection (set once by the store layout). */
export function MarketProvider({ country, children }: { country: string; children: React.ReactNode }) {
  return <MarketCtx.Provider value={{ country, currency: currencyFor(country) }}>{children}</MarketCtx.Provider>;
}

export const useMarket = () => useContext(MarketCtx);

/** Prices and formatting in the visitor's currency (or the one passed in, e.g. at checkout). */
export function useMoney(override?: Currency) {
  const market = useMarket();
  const currency = override ?? market.currency;
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
