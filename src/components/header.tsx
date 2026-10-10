import Link from "next/link";
import { Heart, User } from "lucide-react";
import { Logo } from "./logo";
import { CartButton, MobileMenu, SearchBox } from "./header-client";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/config";

export const navLinks = [
  { href: "/shop?new=1", label: "New Arrivals" },
  { href: "/shop/national-teams", label: "National Teams" },
  { href: "/shop/club-jerseys", label: "Club Jerseys" },
  { href: "/shop/retro", label: "Retro" },
  { href: "/shop/sportswear", label: "Sportswear" },
];

export async function Header() {
  const user = await getCurrentUser();
  return (
    <>
      <div className="bg-ink text-white">
        <div className="container-x flex h-10 items-center justify-center gap-3 text-center text-[13px]">
          <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-accent sm:block" />
          <span className="truncate">{store.announcement}</span>
          <Link href="/shop" className="hidden shrink-0 font-display text-sm tracking-wide text-accent sm:inline">
            Shop now →
          </Link>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-2">
            <MobileMenu links={navLinks} signedIn={!!user} isAdmin={user?.role === "ADMIN"} />
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-[14px] text-ink/80 transition hover:text-ink">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <Logo />
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <SearchBox />
            <Link href="/wishlist" aria-label="Wishlist" className="rounded-full p-2 hover:bg-tile">
              <Heart className="h-5 w-5" strokeWidth={1.6} />
            </Link>
            <Link
              href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/account/login"}
              aria-label="Account"
              className="hidden rounded-full p-2 hover:bg-tile sm:block"
            >
              <User className="h-5 w-5" strokeWidth={1.6} />
            </Link>
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}
