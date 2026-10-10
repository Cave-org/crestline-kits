"use client";

import Link from "next/link";
import clsx from "clsx";
import { Heart } from "lucide-react";
import { ProductImage } from "./product-image";
import { formatMoney } from "@/lib/format";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/use-hydrated";
import type { ProductCard as Card } from "@/lib/catalog";

export function ProductCard({ product, className }: { product: Card; className?: string }) {
  const hydrated = useHydrated();
  const saved = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className={clsx("group relative", className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="aspect-square rounded-md transition group-hover:brightness-[0.97]"
        />
        <div className="mt-3 space-y-1">
          <p className="line-clamp-2 text-[13px] leading-snug text-ink/85">{product.name}</p>
          <p className="flex items-baseline gap-2 text-[15px] font-semibold">
            {formatMoney(product.price)}
            {onSale && (
              <span className="text-xs font-normal text-muted line-through">{formatMoney(product.compareAtPrice!)}</span>
            )}
          </p>
        </div>
      </Link>
      <div className="pointer-events-none absolute left-2.5 top-2.5 flex gap-1.5">
        {onSale && (
          <span className="rounded bg-sale px-1.5 py-0.5 text-[11px] font-semibold text-white">
            -{Math.round(100 - (product.price / product.compareAtPrice!) * 100)}%
          </span>
        )}
        {!product.inStock && (
          <span className="rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">Sold out</span>
        )}
      </div>
      <button
        onClick={() => toggle(product.id)}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={hydrated && saved}
        className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/85 shadow-sm transition hover:bg-white"
      >
        <Heart className={clsx("h-[18px] w-[18px]", hydrated && saved && "fill-sale stroke-sale")} strokeWidth={1.6} />
      </button>
    </div>
  );
}
