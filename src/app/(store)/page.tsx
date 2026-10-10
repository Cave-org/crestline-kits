import Link from "next/link";
import { ArrowRight, BadgeCheck, RefreshCw, Smartphone, Truck } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { ProductRow } from "@/components/product-row";
import { getCategories, listProducts } from "@/lib/catalog";
import { store } from "@/lib/config";
import { formatMoney } from "@/lib/format";


const panelColors = ["#a3245a", "#f2b705", "#0b0b0b", "#f2b705", "#a3245a"];
const collectionColors: Record<string, string> = {
  "national-teams": "#1d3f8f",
  "club-jerseys": "#a3245a",
  retro: "#c8102e",
  sportswear: "#151515",
};

export default async function HomePage() {
  const [featured, national, retro, categories] = await Promise.all([
    listProducts({ featured: true, limit: 8 }),
    listProducts({ category: "national-teams", limit: 8 }),
    listProducts({ category: "retro", limit: 8 }),
    getCategories(),
  ]);
  const heroShirts = featured.slice(0, 5);
  const spotlight = heroShirts[2] ?? heroShirts[0];

  return (
    <>
      {/* Hero */}
      <section className="container-x pt-8 md:pt-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="font-display max-w-4xl text-[2.6rem] sm:text-6xl lg:text-[5.2rem]">
            From the stands to the streets.
            <br />
            Wear your colours.
          </h1>
          <Link href="/shop" className="btn btn-primary shrink-0 self-start md:self-auto">
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-8 md:mt-10">
        <div className="relative grid h-[360px] grid-cols-3 overflow-hidden sm:h-[440px] md:h-[540px] md:grid-cols-5">
          {heroShirts.map((p, i) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className={`relative flex items-center justify-center ${i === 0 || i === 4 ? "hidden md:flex" : "flex"}`}
              style={{ backgroundColor: panelColors[i] }}
            >
              <ProductImage
                src={p.images[0]}
                alt={p.name}
                priority={i === 2}
                sizes="(min-width: 768px) 20vw, 33vw"
                className={`!bg-transparent w-[92%] ${i === 2 ? "aspect-[4/5] scale-110" : "aspect-square opacity-95"}`}
              />
            </Link>
          ))}
          {spotlight && (
            <Link
              href={`/product/${spotlight.slug}`}
              className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-16 text-white md:px-8 md:pb-6"
            >
              <span className="font-display text-2xl sm:text-3xl md:text-4xl">{spotlight.name}</span>
              <span className="shrink-0 text-sm font-semibold">{formatMoney(spotlight.price)}</span>
            </Link>
          )}
        </div>
      </section>

      <ProductRow title="National Teams 2026" href="/shop/national-teams" products={national} />

      {/* Collections */}
      <section className="container-x mt-16 md:mt-20">
        <h2 className="font-display mb-6 text-3xl md:text-4xl">Popular collections</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((c) => {
            const pick = [...featured, ...national, ...retro].find((p) => p.categorySlug === c.slug);
            return (
              <Link
                key={c.id}
                href={`/shop/${c.slug}`}
                className="group relative flex h-64 overflow-hidden rounded-lg p-6 text-white md:h-80"
                style={{ backgroundColor: collectionColors[c.slug] ?? "#151515" }}
              >
                <div className="relative z-10 flex max-w-[58%] flex-col justify-end">
                  <h3 className="font-display text-3xl md:text-4xl">{c.name}</h3>
                  {c.blurb && <p className="mt-2 text-sm text-white/80">{c.blurb}</p>}
                  <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink">
                    View collection <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                {pick && (
                  <ProductImage
                    src={pick.images[0]}
                    alt=""
                    sizes="25vw"
                    className="!bg-transparent absolute -right-6 bottom-0 aspect-square w-[58%] transition duration-300 group-hover:scale-105"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <ProductRow title="Most popular jerseys" href="/shop?sort=newest" products={featured} />

      {/* Printing banner */}
      <section className="container-x mt-16 md:mt-20">
        <div className="grid overflow-hidden rounded-lg md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 bg-ink p-8 text-white md:p-12">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-accent">Make it yours</p>
            <h2 className="font-display text-5xl md:text-6xl">
              Your name.
              <br />
              Your number.
            </h2>
            <p className="max-w-md text-white/75">
              Add official-style name and number printing to any matchday jersey for {formatMoney(store.customizationFee)}.
              Printed in Accra and ready in 2–3 days.
            </p>
            <Link href="/shop" className="btn mt-2 w-fit bg-accent text-ink hover:bg-accent/90">
              Customise a jersey
            </Link>
          </div>
          <div className="relative grid min-h-64 grid-cols-3 items-center gap-2 bg-sale px-4 py-8">
            {featured.slice(3, 6).map((p, i) => (
              <ProductImage
                key={p.id}
                src={p.images[1] ?? p.images[0]}
                alt={p.name}
                sizes="15vw"
                className={`!bg-transparent aspect-square ${i === 1 ? "-translate-y-3" : "translate-y-3"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <ProductRow title="Retro classics" href="/shop/retro" products={retro} />

      {/* Trust strip */}
      <section className="container-x mt-16 md:mt-20">
        <div className="grid grid-cols-2 gap-6 rounded-lg bg-tile p-6 md:grid-cols-4 md:p-8">
          {[
            { icon: Smartphone, title: "Pay with Mobile Money", text: "MTN, Telecel and AirtelTigo" },
            { icon: Truck, title: "Delivery across Ghana", text: "Free in Accra over GH₵ 1,000" },
            { icon: RefreshCw, title: "Easy size exchanges", text: "Within 7 days, unprinted" },
            { icon: BadgeCheck, title: "Quality checked", text: "Every shirt inspected before dispatch" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-2">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-[13px] text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
