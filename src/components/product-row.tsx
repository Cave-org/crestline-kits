import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";
import type { ProductCard as Card } from "@/lib/catalog";

export function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href?: string;
  products: Card[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-x mt-16 md:mt-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 rounded-full border border-line px-3.5 py-1.5 text-[13px] hover:border-ink"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-auto" />
        ))}
      </div>
    </section>
  );
}
