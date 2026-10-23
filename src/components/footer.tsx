import Link from "next/link";
import { Logo } from "./logo";
import { store } from "@/lib/config";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/shop?new=1", label: "New arrivals" },
      { href: "/shop/national-teams", label: "National teams" },
      { href: "/shop/club-jerseys", label: "Club jerseys" },
      { href: "/shop/retro", label: "Retro classics" },
      { href: "/shop/sportswear", label: "Sportswear" },
    ],
  },
  {
    title: "Customer care",
    links: [
      { href: "/help#delivery", label: "Delivery" },
      { href: "/shipping-and-returns", label: "Shipping & refund policy" },
      { href: "/help#sizing", label: "Size guide" },
      { href: "/help#printing", label: "Name & number printing" },
      { href: "/help#contact", label: "Contact us" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "My orders" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/cart", label: "Cart" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-tile">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted">
            {store.tagline}. Delivered across Ghana and beyond, paid securely with Mobile Money or card.
          </p>
          <p className="mt-6 text-sm">
            <a href={`mailto:${store.email}`} className="underline underline-offset-4">
              {store.email}
            </a>
            <br />
            <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="mt-1 inline-block">
              {store.phone}
            </a>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wide">{c.title}</h3>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-col items-start justify-between gap-3 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center">
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>© {new Date().getFullYear()} {store.name}. All rights reserved.</span>
          <Link href="/terms" className="hover:text-ink">Terms of service</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy policy</Link>
          <Link href="/shipping-and-returns" className="hover:text-ink">Shipping &amp; refunds</Link>
        </span>
        <span className="flex flex-wrap items-center gap-2">
          Payments by
          <span className="rounded bg-white px-2 py-1 font-semibold text-ink">MTN MoMo</span>
          <span className="rounded bg-white px-2 py-1 font-semibold text-ink">Telecel Cash</span>
          <span className="rounded bg-white px-2 py-1 font-semibold text-ink">AT Money</span>
          <span className="rounded bg-white px-2 py-1 font-semibold text-ink">Visa</span>
          <span className="rounded bg-white px-2 py-1 font-semibold text-ink">Mastercard</span>
        </span>
      </div>
    </footer>
  );
}
