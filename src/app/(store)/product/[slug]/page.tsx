import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, RefreshCw, Smartphone, Truck } from "lucide-react";
import { Gallery } from "@/components/gallery";
import { BuyBox } from "@/components/buy-box";
import { ProductRow } from "@/components/product-row";
import { getProduct, getRelated } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { store } from "@/lib/config";
import { Price } from "@/components/market";
import { getMarket } from "@/lib/market-server";


type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Jersey not found" };
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    openGraph: { title: p.name, images: p.images[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const [related, { country }] = await Promise.all([getRelated(product.id, product.categoryId), getMarket()]);
  const inGhana = country === "GH";

  return (
    <>
      <div className="container-x pt-6">
        <nav className="text-[13px] text-muted" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-ink">Shop</Link> /{" "}
          <Link href={`/shop/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link> /{" "}
          <span className="text-ink">{product.team}</span>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Gallery images={product.images} alt={product.name} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm text-muted">
              {product.category.name} · {product.kitType}
              {product.season ? ` · ${product.season}` : ""}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-[2.4rem] md:leading-tight">{product.name}</h1>
            <p className="mt-4">
              <Price product={product} size="lg" />
            </p>
            <p className="mt-3 inline-flex rounded-md border border-line bg-tile px-3 py-2 text-[13px] text-ink/80">
              <span>
                <strong>Replica jersey</strong> (fan version). Not official club or brand merchandise.{" "}
                <Link href="/help#authenticity" className="underline">Learn more</Link>
              </span>
            </p>
            <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-muted">{product.description}</p>

            <BuyBox
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0] ?? null,
                color: product.color,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                priceUsd: product.priceUsd,
                compareAtPriceUsd: product.compareAtPriceUsd,
                allowCustomization: product.allowCustomization,
              }}
              variants={product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock }))}
            />

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg bg-tile p-4 text-center text-[12px] text-ink/80">
              <div className="flex flex-col items-center gap-1.5"><Smartphone className="h-4 w-4" strokeWidth={1.6} />{inGhana ? "Mobile Money or card" : "Pay by card"}</div>
              <div className="flex flex-col items-center gap-1.5"><Truck className="h-4 w-4" strokeWidth={1.6} />{inGhana ? "Delivery across Ghana" : "We ship to you"}</div>
              <div className="flex flex-col items-center gap-1.5"><RefreshCw className="h-4 w-4" strokeWidth={1.6} />7-day size exchange</div>
            </div>

            <div className="mt-6 divide-y divide-line border-y border-line">
              <Accordion title="Details" open>
                <ul className="list-disc space-y-1 pl-5">
                  {product.details.map((d) => <li key={d}>{d}</li>)}
                  {product.color && <li>Colour: {product.color}</li>}
                </ul>
              </Accordion>
              <Accordion title="Delivery & payment">
                {inGhana ? (
                  <p>
                    Greater Accra: 1–2 working days. Other regions: 2–4 working days. Free delivery in Greater Accra on
                    orders over {formatMoney(store.freeDeliveryThreshold)}. Pay securely with MTN MoMo, Telecel Cash,
                    AirtelTigo Money or a bank card.
                  </p>
                ) : (
                  <p>
                    We deliver outside Ghana too. Pay for your jerseys by card at checkout, and we'll contact you with the
                    delivery cost and options for your country before we send your order.
                  </p>
                )}
              </Accordion>
              <Accordion title="How it fits">
                <p>Regular fit. Take your usual size; size up for a looser streetwear look. <Link href="/help#sizing" className="underline">See the size guide</Link>.</p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <ProductRow title="You may also like" href={`/shop/${product.category.slug}`} products={related} />
    </>
  );
}

function Accordion({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group py-4" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold uppercase tracking-wide">
        {title}
        <Plus className="h-4 w-4 transition group-open:rotate-45" />
      </summary>
      <div className="pt-3 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  );
}
