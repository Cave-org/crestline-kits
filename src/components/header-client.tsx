"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { ChevronRight, Heart, HelpCircle, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Drawer } from "./drawer";
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
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative border-b border-line bg-white px-4 py-3 shadow-lg">
              <form onSubmit={submit} className="mx-auto flex max-w-2xl items-center gap-3" role="search">
                <Search className="h-5 w-5 shrink-0 text-muted" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by team, season or kit…"
                  aria-label="Search jerseys"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none"
                />
                <button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-tile">
                  <X className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function MobileMenu({
  links,
  signedIn,
  isAdmin,
  logo,
}: {
  links: { href: string; label: string }[];
  signedIn: boolean;
  isAdmin: boolean;
  logo: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname + (params.get("new") ? "?new=1" : "");

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="-ml-2 rounded-full p-2 hover:bg-tile xl:hidden">
        <Menu className="h-5 w-5" strokeWidth={1.6} />
      </button>
      <Drawer open={open} onClose={close} label="Menu">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-5">{logo}</div>
        <nav aria-label="Mobile" className="flex flex-col px-5 py-2">
          {links.map((l) => {
            const active = current === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center justify-between border-b border-line py-4 font-display text-[1.6rem]",
                  active && "text-accent",
                )}
              >
                {l.label}
                <ChevronRight className="h-5 w-5 text-muted" strokeWidth={1.6} />
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1 border-t border-line bg-tile/60 px-5 py-5 text-[15px]">
          <Link href="/wishlist" onClick={close} className="flex items-center gap-3 py-2">
            <Heart className="h-5 w-5" strokeWidth={1.6} /> Wishlist
          </Link>
          <Link
            href={signedIn ? (isAdmin ? "/admin" : "/account") : "/account/login"}
            onClick={close}
            className="flex items-center gap-3 py-2"
          >
            <User className="h-5 w-5" strokeWidth={1.6} />
            {signedIn ? (isAdmin ? "Admin dashboard" : "My account") : "Sign in"}
          </Link>
          <Link href="/help" onClick={close} className="flex items-center gap-3 py-2">
            <HelpCircle className="h-5 w-5" strokeWidth={1.6} /> Help & delivery
          </Link>
        </div>
      </Drawer>
    </>
  );
}
