"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { QtyStepper } from "./qty-stepper";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/use-hydrated";
import { useMoney } from "./market";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string | null;
    color: string | null;
    price: number;
    compareAtPrice: number | null;
    priceUsd: number | null;
    compareAtPriceUsd: number | null;
    allowCustomization: boolean;
  };
  variants: { id: string; size: string; stock: number }[];
};

export function BuyBox({ product, variants }: Props) {
  const money = useMoney();
  const customizationFee = money.printing;
  const router = useRouter();
  const add = useCart((s) => s.add);
  const hydrated = useHydrated();
  const saved = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);

  const firstAvailable = variants.find((v) => v.stock > 0);
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
  const [qty, setQty] = useState(1);
  const [printing, setPrinting] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const variant = variants.find((v) => v.id === variantId);
  const soldOut = !firstAvailable;
  const unit = money.price(product).price + (printing && (customName || customNumber) ? customizationFee : 0);

  function addToCart() {
    setError("");
    if (!variant) return setError("Choose a size first");
    if (printing && !customName.trim() && !customNumber.trim()) return setError("Add a name or number, or switch printing off");
    add({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: variant.size,
      color: product.color,
      price: product.price,
      priceUsd: product.priceUsd,
      quantity: qty,
      customName: printing ? customName.trim().toUpperCase() || null : null,
      customNumber: printing ? customNumber.trim() || null : null,
      maxStock: variant.stock,
    });
    return true;
  }

  return (
    <div className="mt-6 space-y-6">
      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="text-sm font-semibold">
            Size{variant ? `: ${variant.size}` : ""}
          </legend>
          {variant && variant.stock <= 3 && <span className="text-[13px] text-sale">Only {variant.stock} left</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock === 0}
              onClick={() => {
                setVariantId(v.id);
                setQty(1);
              }}
              aria-pressed={v.id === variantId}
              className={clsx(
                "h-11 min-w-14 rounded-md border px-3 text-sm transition",
                v.id === variantId ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                v.stock === 0 && "cursor-not-allowed text-muted line-through opacity-50 hover:border-line",
              )}
            >
              {v.size}
            </button>
          ))}
        </div>
      </fieldset>

      {product.allowCustomization && (
        <div className="rounded-lg border border-line p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold">Add name & number</span>
              <span className="text-[13px] text-muted">+{money.format(customizationFee)} per shirt</span>
            </span>
            <input
              type="checkbox"
              checked={printing}
              onChange={(e) => setPrinting(e.target.checked)}
              className="h-5 w-5 accent-ink"
            />
          </label>
          {printing && (
            <div className="mt-4 grid grid-cols-[1fr_96px] gap-3">
              <div>
                <label className="label" htmlFor="pname">Name</label>
                <input
                  id="pname"
                  className="input uppercase"
                  maxLength={14}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.replace(/[^A-Za-z .'-]/g, ""))}
                  placeholder="AYEW"
                />
              </div>
              <div>
                <label className="label" htmlFor="pnum">Number</label>
                <input
                  id="pnum"
                  className="input"
                  inputMode="numeric"
                  maxLength={2}
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="10"
                />
              </div>
              <p className="col-span-2 text-[12px] text-muted">Printed shirts can't be exchanged, so double-check your spelling.</p>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold">Quantity</p>
        <QtyStepper value={qty} onChange={setQty} max={Math.min(variant?.stock ?? 1, 20)} />
      </div>

      {error && <p className="text-sm text-sale" role="alert">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            if (addToCart()) {
              setAdded(true);
              setTimeout(() => setAdded(false), 2200);
            }
          }}
          className="btn btn-primary flex-1"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {soldOut ? "Sold out" : added ? "Added to cart" : `Add to cart · ${money.format(unit * qty)}`}
        </button>
        <button
          type="button"
          onClick={() => toggleWish(product.id)}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={hydrated && saved}
          className="btn btn-outline !px-4"
        >
          <Heart className={clsx("h-5 w-5", hydrated && saved && "fill-sale stroke-sale")} strokeWidth={1.6} />
        </button>
      </div>
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          if (addToCart()) router.push("/checkout");
        }}
        className="btn btn-outline w-full"
      >
        Buy now
      </button>
    </div>
  );
}
