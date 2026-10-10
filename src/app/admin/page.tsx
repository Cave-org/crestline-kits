import Link from "next/link";
import { and, asc, desc, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, productVariants } from "@/db/schema";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/order-summary";

const PAID_STATES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default async function AdminDashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [[sales], [toFulfil], lowStock, recent] = await Promise.all([
    db
      .select({ revenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`, count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(inArray(orders.status, [...PAID_STATES]), gte(orders.createdAt, since))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(inArray(orders.status, ["PAID", "PROCESSING"])),
    db.query.productVariants.findMany({
      where: lte(productVariants.stock, 2),
      with: { product: { columns: { name: true, id: true, active: true } } },
      orderBy: asc(productVariants.stock),
      limit: 12,
    }),
    db.query.orders.findMany({ orderBy: desc(orders.createdAt), limit: 8 }),
  ]);

  const low = lowStock.filter((v) => v.product.active);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Sales, last 30 days" value={formatMoney(sales.revenue)} />
        <Stat label="Paid orders, last 30 days" value={String(sales.count)} />
        <Stat label="Waiting to ship" value={String(toFulfil.count)} href="/admin/orders?status=PAID" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm underline underline-offset-4">All orders</Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-line">
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 pr-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.number}</Link>
                        <p className="text-[12px] text-muted">{o.name}</p>
                      </td>
                      <td className="py-3 pr-3 text-muted">{formatDate(o.createdAt)}</td>
                      <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
                      <td className="py-3 text-right font-medium">{formatMoney(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-5">
          <h2 className="font-semibold">Low stock</h2>
          {low.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Everything is well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {low.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/products/${v.product.id}`} className="min-w-0 truncate hover:underline">
                    {v.product.name} <span className="text-muted">· {v.size}</span>
                  </Link>
                  <span className={v.stock === 0 ? "font-semibold text-sale" : "font-medium"}>
                    {v.stock === 0 ? "Sold out" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="rounded-xl bg-white p-5 hover:ring-1 hover:ring-ink">{body}</Link>
  ) : (
    <div className="rounded-xl bg-white p-5">{body}</div>
  );
}
