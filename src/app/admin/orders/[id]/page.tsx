import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { countryName } from "@/lib/countries";
import { OrderSummary, StatusBadge, statusLabels } from "@/components/order-summary";
import { updateOrderStatus } from "../../actions";

const flow = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id), with: { items: true } });
  if (!order) notFound();
  const waText = encodeURIComponent(`Hi ${order.name.split(" ")[0]}, this is Crestline Kits about your order ${order.number}.`);
  const waPhone = order.phone.replace(/^0/, "233").replace(/^\+/, "");

  return (
    <div className="max-w-5xl">
      <Link href="/admin/orders" className="text-sm text-muted hover:text-ink">← Orders</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{order.number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        Placed {formatDate(order.createdAt)}
        {order.paidAt && ` · Paid ${formatDate(order.paidAt)} via ${order.paymentChannel?.replace("_", " ")}`}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-white">
          <OrderSummary order={order} />
        </div>
        <div className="space-y-4">
          <section className="rounded-xl bg-white p-5">
            <h2 className="font-semibold">Update status</h2>
            {order.status === "PENDING" ? (
              <p className="mt-2 text-sm text-muted">
                Waiting for payment. This updates automatically when Paystack confirms the Mobile Money payment.
              </p>
            ) : null}
            <form action={updateOrderStatus} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="input !py-2 text-sm">
                {(order.status === "PENDING" ? (["PENDING", ...flow] as const) : flow).map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
              <button className="btn btn-primary !py-2">Save</button>
            </form>
          </section>

          <section className="rounded-xl bg-white p-5 text-sm">
            <h2 className="font-semibold">Customer</h2>
            <p className="mt-2">{order.name}</p>
            <p className="text-muted">{order.email}</p>
            <p className="text-muted">{order.phone}</p>
            <div className="mt-3 flex gap-2">
              <a href={`tel:${order.phone}`} className="btn btn-outline !px-3 !py-1.5 text-[13px]">Call</a>
              <a href={`https://wa.me/${waPhone}?text=${waText}`} target="_blank" rel="noreferrer" className="btn btn-outline !px-3 !py-1.5 text-[13px]">
                WhatsApp
              </a>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 text-sm">
            <h2 className="font-semibold">{order.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}</h2>
            {order.deliveryMethod === "pickup" ? (
              <p className="mt-2 text-muted">Customer will collect · {order.region}</p>
            ) : (
              <p className="mt-2 text-muted">
                {order.address}
                <br />
                {order.city}, {order.region}
                {order.country !== "GH" && (
                  <>
                    <br />
                    <strong className="text-ink">{countryName(order.country)}</strong>
                  </>
                )}
              </p>
            )}
            {order.country !== "GH" && (
              <p className="mt-3 rounded bg-accent/15 p-3 text-ink">
                International order, paid in {order.currency}. Delivery hasn't been charged: contact the customer with the
                shipping cost and options.
              </p>
            )}
            {order.notes && <p className="mt-3 rounded bg-tile p-3">“{order.notes}”</p>}
          </section>

          {order.paymentRef && (
            <p className="px-1 text-[12px] text-muted">Paystack reference: {order.paymentRef}</p>
          )}
        </div>
      </div>
    </div>
  );
}
