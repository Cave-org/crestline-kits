"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/use-hydrated";
import type { ProductCard as Card } from "@/lib/catalog";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<Card[] | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((j) => !cancelled && setProducts(j.products))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [hydrated, ids]);

  // Keep the saved order and hide items removed since the list was fetched
  const shown = (products ?? []).filter((p) => ids.includes(p.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  return (
    <div className="container-x pt-8 md:pt-12">
      <h1 className="font-display text-4xl md:text-5xl">Wishlist</h1>
      {products === null ? (
        <div className="min-h-[40vh]" />
      ) : shown.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted">Tap the heart on any jersey to save it here.</p>
          <Link href="/shop" className="btn btn-primary mt-6">Browse jerseys</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
