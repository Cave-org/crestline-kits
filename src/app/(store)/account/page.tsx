import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/order-summary";
import { logout } from "./actions";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  const list = await db.query.orders.findMany({
    where: and(eq(orders.userId, user.id), ne(orders.status, "CANCELLED")),
    orderBy: desc(orders.createdAt),
    with: { items: { columns: { quantity: true } } },
  });

  return (
    <div className="container-x max-w-4xl pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-muted">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "ADMIN" && <Link href="/admin" className="btn btn-outline">Admin dashboard</Link>}
          <form action={logout}>
            <button className="btn btn-outline">Sign out</button>
          </form>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Your orders</h2>
      {list.length === 0 ? (
        <div className="mt-4 rounded-xl border border-line p-8 text-center">
          <p className="text-muted">No orders yet.</p>
          <Link href="/shop" className="btn btn-primary mt-4">Start shopping</Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
          {list.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.number}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-tile md:p-5">
                <div>
                  <p className="font-medium">{o.number}</p>
                  <p className="text-[13px] text-muted">
                    {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={o.status} />
                  <span className="font-semibold">{formatMoney(o.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
