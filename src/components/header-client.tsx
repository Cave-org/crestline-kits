"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/lib/use-hydrated";

export function CartButton() {
  const hydrated = useHydrated();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  return (
    <Link href="/cart" aria-label={`Cart, ${hydrated ? count : 0} items`} className="relative rounded-full p-2 hover:bg-tile">
      <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}

export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <>
      <form onSubmit={submit} className="hidden items-center gap-2 rounded-md bg-tile px-3 py-2 xl:flex" role="search">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jerseys…"
          aria-label="Search jerseys"
          className="w-40 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </form>
      <button onClick={() => setOpen(true)} aria-label="Search" className="rounded-full p-2 hover:bg-tile xl:hidden">
        <Search className="h-5 w-5" strokeWidth={1.6} />
      </button>
      {open && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-line bg-white p-4 shadow-lg">
          <form onSubmit={submit} className="mx-auto flex max-w-2xl items-center gap-3" role="search">
            <Search className="h-5 w-5 text-muted" />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by team, season or kit…"
              aria-label="Search jerseys"
              className="flex-1 bg-transparent py-2 text-base outline-none"
            />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="p-2">
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export function MobileMenu({
  links,
  signedIn,
  isAdmin,
}: {
  links: { href: string; label: string }[];
  signedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open menu" className="-ml-2 rounded-full p-2 hover:bg-tile lg:hidden">
        <Menu className="h-5 w-5" strokeWidth={1.6} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col bg-white p-6" aria-label="Mobile">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="mb-6 self-end p-1">
              <X className="h-5 w-5" />
            </button>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-display text-2xl"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/wishlist" onClick={() => setOpen(false)} className="mt-6 py-2 text-sm">
              Wishlist
            </Link>
            <Link
              href={signedIn ? (isAdmin ? "/admin" : "/account") : "/account/login"}
              onClick={() => setOpen(false)}
              className="py-2 text-sm"
            >
              {signedIn ? (isAdmin ? "Admin dashboard" : "My account") : "Sign in"}
            </Link>
            <Link href="/help" onClick={() => setOpen(false)} className="py-2 text-sm">
              Help & delivery
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
