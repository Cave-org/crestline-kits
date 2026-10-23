"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { CreditCard, Globe, Lock, Smartphone } from "lucide-react";
import { ProductImage } from "./product-image";
import { PageSkeleton } from "./skeletons";
import { cartLines, cartUnit } from "./cart-view";
import { useMarket, useMoney } from "./market";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/lib/use-hydrated";
import { regions } from "@/lib/config";
import { buyerCurrency, ghanaDeliveryFee, priceFor, usdToGhs } from "@/lib/market";
import { countryCodes, countryOptions } from "@/lib/countries";
import { formatMoney } from "@/lib/format";

type Defaults = { email: string; name: string; phone: string };

export function CheckoutForm({ defaults, signedIn }: { defaults: Defaults; signedIn: boolean }) {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const promoCode = useCart((s) => s.promoCode);
  // Prices follow where the buyer is (detected, can't be changed). The delivery country only
  // matters for the address, and delivering outside Ghana/Nigeria always uses USD prices.
  const { country: ipCountry, currency: ipCurrency } = useMarket();
  const [country, setCountry] = useState(countryCodes.includes(ipCountry) ? ipCountry : "GH");
  const money = useMoney(buyerCurrency(ipCountry, country));
  const ghana = country === "GH";

  const [form, setForm] = useState({
    ...defaults,
    deliveryMethod: "delivery" as "delivery" | "pickup",
    region: "Greater Accra" as string,
    city: "",
    address: "",
    notes: "",
  });
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const [field, setField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated || !promoCode || items.length === 0) return;
    fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, country, lines: cartLines(items) }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setDiscount(j?.discount ?? 0))
      .catch(() => setDiscount(0));
  }, [hydrated, promoCode, items, country]);

  // "Region" is a Ghana region in Ghana and a typed-in state/province elsewhere; pickup is Ghana only
  useEffect(() => {
    setForm((f) => {
      const isGhanaRegion = (regions as readonly string[]).includes(f.region);
      if (ghana) return { ...f, region: isGhanaRegion ? f.region : "Greater Accra" };
      return { ...f, region: isGhanaRegion ? "" : f.region, deliveryMethod: "delivery" };
    });
  }, [ghana]);

  if (!hydrated) return <PageSkeleton />;

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-5xl">Nothing to check out</h1>
        <Link href="/shop" className="btn btn-primary mt-8">Shop jerseys</Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + priceFor({ price: i.price, priceUsd: i.priceUsd }, money.currency).price * i.quantity, 0);
  const printing = items.reduce((s, i) => s + (i.customName || i.customNumber ? money.printing * i.quantity : 0), 0);
  const delivery = ghanaDeliveryFee(country, money.currency, form.deliveryMethod, form.region, subtotal);
  const total = Math.max(0, subtotal + printing + delivery - discount);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setField(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, country, promoCode, lines: cartLines(items) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
        setField(json.field ?? null);
        setSubmitting(false);
        return;
      }
      window.location.href = json.authorizationUrl;
    } catch {
      setError("Network problem. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const inputCls = (name: string) => clsx("input", field === name && "!border-sale");

  return (
    <div className="container-x pt-8 md:pt-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Contact</h2>
              {!signedIn && (
                <Link href="/account/login?next=/checkout" className="text-sm underline underline-offset-4">
                  Sign in
                </Link>
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" required autoComplete="email" className={inputCls("email")} value={form.email} onChange={set("email")} />
              </div>
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" required autoComplete="name" className={inputCls("name")} value={form.name} onChange={set("name")} />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone number</label>
                <input id="phone" type="tel" required autoComplete="tel" placeholder={ghana ? "024 123 4567" : "With country code, e.g. +44 7700 900123"} className={inputCls("phone")} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[\s()-]/g, "") }))} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Delivery</h2>
            <div className="mt-4">
              <label className="label" htmlFor="country">Country</label>
              <select id="country" className={inputCls("country")} value={country} onChange={(e) => setCountry(e.target.value)}>
                {countryOptions.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              {money.currency !== ipCurrency && (
                <p className="mt-2 text-[13px] text-muted">
                  Prices are in US dollars for delivery outside Ghana and Nigeria.
                </p>
              )}
            </div>

            {ghana ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["delivery", "pickup"] as const).map((m) => (
                  <label
                    key={m}
                    className={clsx(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
                      form.deliveryMethod === m ? "border-ink" : "border-line",
                    )}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={form.deliveryMethod === m}
                      onChange={() => setForm((f) => ({ ...f, deliveryMethod: m }))}
                      className="mt-1 accent-ink"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{m === "delivery" ? "Deliver to me" : "Pick up"}</span>
                      <span className="text-[13px] text-muted">
                        {m === "delivery" ? "1–4 working days across Ghana" : "Free · we'll call when it's ready"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-line p-4">
                <Globe className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.6} />
                <p className="text-sm text-ink/80">
                  <strong>Delivery is arranged after you order.</strong> You pay for the jerseys now, and we'll contact you by
                  email or WhatsApp with the delivery cost and options for your country before we send anything.
                </p>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="region">{ghana ? "Region" : "State / province / region"}</label>
                {ghana ? (
                  <select id="region" className={inputCls("region")} value={form.region} onChange={set("region")}>
                    {regions.map((r) => <option key={r}>{r}</option>)}
                  </select>
                ) : (
                  <input id="region" autoComplete="address-level1" className={inputCls("region")} value={form.region} onChange={set("region")} />
                )}
              </div>
              {form.deliveryMethod === "delivery" && (
                <>
                  <div>
                    <label className="label" htmlFor="city">Town / city</label>
                    <input id="city" autoComplete="address-level2" className={inputCls("city")} value={form.city} onChange={set("city")} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="address">Address</label>
                    <input
                      id="address"
                      autoComplete="street-address"
                      placeholder={ghana ? "House no., street, landmark or GhanaPost GPS" : "Street address, apartment, postcode"}
                      className={inputCls("address")}
                      value={form.address}
                      onChange={set("address")}
                    />
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label className="label" htmlFor="notes">Notes (optional)</label>
                <textarea id="notes" rows={2} className="input" value={form.notes} onChange={set("notes")} placeholder={ghana ? "Anything the rider should know" : "Anything we should know about delivery"} />
              </div>
            </div>
          </section>

          <section className="flex items-start gap-3 rounded-lg bg-tile p-4">
            {ghana ? (
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.6} />
            ) : (
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.6} />
            )}
            <p className="text-sm text-ink/80">
              {ghana ? (
                <>
                  You'll pay with <strong>Mobile Money</strong> (MTN, Telecel or AirtelTigo) or a <strong>bank card</strong> on
                  the next screen.
                </>
              ) : (
                <>
                  You'll pay by <strong>Visa or Mastercard</strong> on the next screen. Payments are processed in Ghana
                  cedis{money.currency === "USD" && ", and your bank converts it to your own currency"}.
                </>
              )}
            </p>
          </section>
        </div>

        <aside className="rounded-xl border border-line p-5 md:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-2 max-h-80 space-y-4 overflow-y-auto pr-1 pt-2">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3">
                <div className="relative">
                  <ProductImage src={i.image} alt={i.name} sizes="64px" className="h-16 w-16 rounded-md" />
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">
                    {i.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{i.name}</p>
                  <p className="text-[12px] text-muted">
                    Size {i.size}
                    {(i.customName || i.customNumber) && ` · ${[i.customName, i.customNumber].filter(Boolean).join(" ")}`}
                  </p>
                </div>
                <p className="text-sm font-medium">{money.format(cartUnit(i, money.currency) * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
            <Line label="Subtotal" value={money.format(subtotal)} />
            {printing > 0 && <Line label="Printing" value={money.format(printing)} />}
            <Line label="Delivery" value={!ghana ? "Arranged after order" : delivery === 0 ? "Free" : money.format(delivery)} />
            {discount > 0 && <Line label={`Discount (${promoCode})`} value={`- ${money.format(discount)}`} />}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-semibold">{money.format(total)}</span>
          </div>
          {money.currency === "USD" && (
            <p className="mt-2 text-right text-[12px] text-muted">
              Charged as {formatMoney(usdToGhs(total))}. Your bank converts it to your currency.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-md bg-sale/10 p-3 text-sm text-sale" role="alert">
              {error}
            </p>
          )}
          <button disabled={submitting} className="btn btn-primary mt-5 w-full !py-4 text-base">
            <Lock className="h-4 w-4" />
            {submitting ? "Starting payment…" : `Pay ${money.format(total)}`}
          </button>
          <p className="mt-3 text-center text-[12px] text-muted">
            Secured by Paystack. By paying you agree to our{" "}
            <Link href="/terms" target="_blank" className="underline">terms</Link>,{" "}
            <Link href="/privacy" target="_blank" className="underline">privacy policy</Link> and{" "}
            <Link href="/shipping-and-returns" target="_blank" className="underline">
              shipping & refund policy
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
