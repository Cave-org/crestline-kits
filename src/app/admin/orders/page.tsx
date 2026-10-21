import { countryName } from "@/lib/countries";
import Link from "next/link";
import clsx from "clsx";
import { desc, eq, ilike, or, and, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge, statusLabels } from "@/components/order-summary";

export const metadata = { title: "Orders" };

const tabs = ["ALL", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "PENDING", "CANCELLED"] as const;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = tabs.includes(sp.status as (typeof tabs)[number]) ? (sp.status as (typeof tabs)[number]) : "ALL";
  const where: SQL[] = [];
  if (status !== "ALL") where.push(eq(orders.status, status));
  if (sp.q?.trim()) {
    const t = `%${sp.q.trim()}%`;
    where.push(or(ilike(orders.number, t), ilike(orders.name, t), ilike(orders.phone, t), ilike(orders.email, t))!);
  }
  const list = await db.query.orders.findMany({
    where: where.length ? and(...where) : undefined,
    orderBy: desc(orders.createdAt),
    limit: 200,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <form className="flex gap-2">
          {status !== "ALL" && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={sp.q} placeholder="Order no., name or phone" className="input !w-64 !py-2 text-sm" />
          <button className="btn btn-primary !py-2">Search</button>
        </form>
      </div>

      <div className="no-scrollbar mt-5 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t}
            href={t === "ALL" ? "/admin/orders" : `/admin/orders?status=${t}`}
            className={clsx("shrink-0 rounded-full px-3.5 py-1.5 text-[13px]", status === t ? "bg-ink text-white" : "bg-white hover:bg-line")}
          >
            {t === "ALL" ? "All" : statusLabels[t]}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl bg-white">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No orders match.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Delivery</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((o) => (
                <tr key={o.id} className="hover:bg-tile/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.number}</Link>
                    <p className="text-[12px] text-muted">{formatDate(o.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3">
                    {o.name}
                    <p className="text-[12px] text-muted">{o.phone}</p>
                  </td>
                  <td className="px-5 py-3 text-muted">{o.deliveryMethod === "pickup" ? "Pickup" : `${o.city}, ${o.country === "GH" ? o.region : countryName(o.country)}`}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-medium">{formatMoney(o.total, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
