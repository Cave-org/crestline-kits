"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Heart, X } from "lucide-react";
import { ProductImage } from "./product-image";
import { PageSkeleton } from "./skeletons";
import { QtyStepper } from "./qty-stepper";
import { useCart, type CartItem } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/use-hydrated";
import { CountrySelect, useMarket, useMoney } from "./market";
import { priceFor, printingFee, type Currency } from "@/lib/market";

export function cartLines(items: CartItem[]) {
  return items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    quantity: i.quantity,
    customName: i.customName ?? null,
    customNumber: i.customNumber ?? null,
  }));
}

/** One shirt's price in the buyer's currency, including printing. */
export function cartUnit(item: CartItem, currency: Currency) {
  const base = priceFor({ price: item.price, priceUsd: item.priceUsd }, currency).price;
  return base + (item.customName || item.customNumber ? printingFee(currency) : 0);
}

export function CartView() {
  const { country } = useMarket();
  const money = useMoney();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const promoCode = useCart((s) => s.promoCode);
  const setPromo = useCart((s) => s.setPromo);

  const [code, setCode] = useState(promoCode ?? "");
  const [discount, setDiscount] = useState<number | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [applying, setApplying] = useState(false);

  const check = useCallback(
    async (value: string, quiet = false) => {
      if (!value.trim() || items.length === 0) return;
      setApplying(true);
      if (!quiet) setPromoMsg("");
      try {
        const res = await fetch("/api/promo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: value, country, lines: cartLines(items) }),
        });
        const json = await res.json();
        if (!res.ok) {
          setPromo(null);
          setDiscount(null);
          setPromoMsg(json.error);
        } else {
          setPromo(json.code);
          setCode(json.code);
          setDiscount(json.discount);
          if (!quiet) setPromoMsg(`${json.code} applied`);
        }
      } finally {
        setApplying(false);
      }
    },
    [items, setPromo, country],
  );

  // Re-check a saved promo code whenever the cart changes, so the discount stays accurate
  useEffect(() => {
    if (hydrated && promoCode) check(promoCode, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, items, country]);

  if (!hydrated) return <PageSkeleton />;

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + priceFor({ price: i.price, priceUsd: i.priceUsd }, money.currency).price * i.quantity, 0);
  const printing = items.reduce((s, i) => s + (i.customName || i.customNumber ? money.printing * i.quantity : 0), 0);
  const shownDiscount = promoCode && discount != null ? discount : 0;

  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    check(code);
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-5xl">Your cart is empty</h1>
        <p className="mt-3 text-muted">Find your next matchday shirt.</p>
        <Link href="/shop" className="btn btn-primary mt-8">Shop jerseys</Link>
      </div>
    );
  }

  return (
    <div className="container-x pt-8 md:pt-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your cart</h1>
      <p className="mt-1 text-muted">
        {count} {count === 1 ? "product" : "products"} in your cart
      </p>

      <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border border-line px-4 md:px-8">
          {items.map((item) => (
            <CartRow key={item.key} item={item} />
          ))}
        </div>

        <aside className="rounded-xl border border-line p-5 md:p-6 lg:sticky lg:top-24">
          <form onSubmit={applyPromo} className="flex overflow-hidden rounded-md border border-line bg-tile">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Promo code"
              aria-label="Promo code"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
            />
            <button disabled={applying} className="border-l border-line bg-white px-5 text-sm font-medium disabled:opacity-50">
              {applying ? "…" : "Apply"}
            </button>
          </form>
          {promoMsg && (
            <p className={clsx("mt-2 text-[13px]", promoCode ? "text-ok" : "text-sale")} role="status">
              {promoMsg}
            </p>
          )}

          <label className="mt-5 flex items-center justify-between gap-3 text-[15px]">
            <span className="text-muted">Shipping to</span>
            <CountrySelect className="max-w-[60%] rounded-md border border-line bg-white px-2.5 py-2 text-sm outline-none focus:border-ink" />
          </label>

          <dl className="mt-4 space-y-3 text-[15px]">
            <Row label={`${count} ${count === 1 ? "item" : "items"}`} value={money.format(subtotal)} />
            {printing > 0 && <Row label="Name & number printing" value={money.format(printing)} />}
            <Row label="Delivery" value={country === "GH" ? "At checkout" : "Arranged after order"} muted />
            {shownDiscount > 0 && <Row label="Discount" value={`- ${money.format(shownDiscount)}`} />}
          </dl>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-semibold">{money.format(subtotal + printing - shownDiscount)}</span>
          </div>
          <Link href="/checkout" className="btn btn-primary mt-6 w-full !py-4 text-base">
            Checkout
          </Link>
          <p className="mt-3 text-center text-[12px] text-muted">
            {country === "GH" ? "Pay securely with Mobile Money or card" : "Pay securely by card"}
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={clsx("font-medium", muted && "text-muted")}>{value}</dd>
    </div>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const saved = useWishlist((s) => s.ids.includes(item.productId));
  const toggle = useWishlist((s) => s.toggle);
  const money = useMoney();
  const printed = item.customName || item.customNumber;
  const unit = cartUnit(item, money.currency);

  return (
    <div className="flex gap-4 border-b border-line py-6 last:border-b-0 md:gap-5">
      <Link href={`/product/${item.slug}`} className="shrink-0">
        <ProductImage src={item.image} alt={item.name} sizes="140px" className="h-24 w-24 rounded-md md:h-32 md:w-32" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:justify-between">
        <div className="min-w-0 space-y-1">
          <Link href={`/product/${item.slug}`} className="block font-medium leading-snug md:text-lg">
            {item.name}
          </Link>
          {item.color && <p className="text-[13px] text-muted">Colour: {item.color}</p>}
          <p className="text-[13px] text-muted">Size: {item.size}</p>
          {printed && (
            <p className="text-[13px] text-muted">
              Printing: {[item.customName, item.customNumber].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="text-[13px] text-muted">Price: {money.format(unit)} / per item</p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end md:justify-between">
          <p className="font-semibold md:text-lg">{money.format(unit * item.quantity)}</p>
          <div className="flex items-center gap-2">
            <QtyStepper small value={item.quantity} max={Math.min(item.maxStock, 20)} onChange={(n) => setQuantity(item.key, n)} />
            <button
              onClick={() => toggle(item.productId)}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              className="grid h-10 w-10 place-items-center rounded-md bg-tile hover:bg-line"
            >
              <Heart className={clsx("h-[18px] w-[18px]", saved && "fill-sale stroke-sale")} strokeWidth={1.6} />
            </button>
            <button
              onClick={() => remove(item.key)}
              aria-label={`Remove ${item.name} from cart`}
              className="grid h-10 w-10 place-items-center rounded-md bg-tile hover:bg-line"
            >
              <X className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
