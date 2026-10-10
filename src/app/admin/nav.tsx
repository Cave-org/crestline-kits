"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import clsx from "clsx";
import { LayoutDashboard, Menu, Package, Shirt, Store, Tag } from "lucide-react";
import { Drawer } from "@/components/drawer";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Shirt },
  { href: "/admin/promos", label: "Promo codes", icon: Tag },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Admin">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm",
              active ? "bg-ink text-white" : "text-ink/75 hover:bg-tile",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Top bar + slide-in menu for phones and tablets (below 1024px). */
export function AdminMobileBar({
  logo,
  email,
  footer,
}: {
  logo: React.ReactNode;
  email: string;
  footer: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const path = usePathname();
  const current = items.find((i) => (i.exact ? path === i.href : path.startsWith(i.href)));

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-white px-3 lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="Open admin menu" aria-expanded={open} className="grid h-10 w-10 place-items-center rounded-full hover:bg-tile">
        <Menu className="h-5 w-5" />
      </button>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{current?.label ?? "Admin"}</span>
      {logo}
      <Drawer open={open} onClose={close} label="Admin menu">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-line px-5">
          {logo}
          <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Admin</span>
        </div>
        <div className="py-4">
          <AdminNav onNavigate={close} />
        </div>
        <div className="mt-auto border-t border-line px-5 py-5 text-sm">
          <p className="truncate text-muted">{email}</p>
          <div className="mt-3 flex items-center gap-4">
            <Link href="/" onClick={close} className="inline-flex items-center gap-1.5 underline underline-offset-4">
              <Store className="h-4 w-4" /> View store
            </Link>
            {footer}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
