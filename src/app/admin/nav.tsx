"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Package, Shirt, Store, Tag } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Shirt },
  { href: "/admin/promos", label: "Promo codes", icon: Tag },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm",
              active ? "bg-ink text-white" : "text-ink/75 hover:bg-tile",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
      <Link href="/" className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm text-ink/75 hover:bg-tile lg:hidden">
        <Store className="h-4 w-4" strokeWidth={1.8} />
        Store
      </Link>
    </nav>
  );
}
