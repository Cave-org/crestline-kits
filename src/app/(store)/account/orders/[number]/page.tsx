import { countryName } from "@/lib/countries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { OrderSummary, StatusBadge } from "@/components/order-summary";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const user = await requireUser();
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.number, number), eq(orders.userId, user.id)),
    with: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="container-x max-w-2xl pt-10">
      <Link href="/account" className="text-sm text-muted hover:text-ink">← All orders</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">{order.number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-muted">Placed {formatDate(order.createdAt)}</p>
      <div className="mt-6">
        <OrderSummary order={order} />
      </div>
      <div className="mt-6 rounded-xl bg-tile p-5 text-sm">
        <p className="font-semibold">{order.deliveryMethod === "pickup" ? "Pickup" : "Delivery address"}</p>
        <p className="mt-1 text-muted">
          {order.deliveryMethod === "pickup" ? "We'll call you when it's ready." : [order.address, order.city, order.region, order.country !== "GH" && countryName(order.country)].filter(Boolean).join(", ")}
        </p>
      </div>
    </div>
  );
}
