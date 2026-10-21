import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { verifyTransaction } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/orders";
import { ClearCart } from "@/components/clear-cart";
import { OrderSummary } from "@/components/order-summary";
import { countryName } from "@/lib/countries";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[]; trxref?: string | string[] }>;
}) {
  const sp = await searchParams;
  // The same value can arrive more than once (e.g. ?reference=X&reference=X), so take the first
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const reference = first(sp.reference) ?? first(sp.trxref);
  if (!reference) return <Failed message="We couldn't find that payment." />;

  let paid = false;
  try {
    const tx = await verifyTransaction(reference);
    if (tx.status === "success") {
      const result = await markOrderPaid(tx.reference, tx.amount, tx.currency, tx.channel, tx.paid_at);
      paid = result.ok;
    }
  } catch (e) {
    console.error("Verify failed", e);
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.paymentRef, reference),
    with: { items: true },
  });
  if (!order) return <Failed message="We couldn't find that order." />;

  if (!paid && order.status === "PENDING") {
    return (
      <Failed message="Your payment wasn't completed, so you haven't been charged. Your cart is still saved." />
    );
  }

  return (
    <div className="container-x max-w-2xl pt-12">
      <ClearCart />
      <CheckCircle2 className="h-12 w-12 text-ok" strokeWidth={1.5} />
      <h1 className="font-display mt-4 text-5xl">Thank you, {order.name.split(" ")[0]}!</h1>
      <p className="mt-3 text-muted">
        Order <strong className="text-ink">{order.number}</strong> is confirmed. Keep this number for reference.{" "}
        {order.country === "GH"
          ? `We'll call ${order.phone} when it's on the way.`
          : `We'll contact you at ${order.email} or on WhatsApp with the delivery cost and options for ${countryName(order.country)}.`}
      </p>
      <div className="mt-8">
        <OrderSummary order={order} />
      </div>
      <div className="mt-6 rounded-xl bg-tile p-5 text-sm">
        <p className="font-semibold">{order.deliveryMethod === "pickup" ? "Pickup" : "Delivering to"}</p>
        <p className="mt-1 text-muted">
          {order.deliveryMethod === "pickup" ? "We'll call you when your order is ready to collect." : [order.address, order.city, order.region, order.country !== "GH" && countryName(order.country)].filter(Boolean).join(", ")}
        </p>
      </div>
      <Link href="/shop" className="btn btn-primary mt-8">Continue shopping</Link>
    </div>
  );
}

function Failed({ message }: { message: string }) {
  return (
    <div className="container-x max-w-xl py-20 text-center">
      <XCircle className="mx-auto h-12 w-12 text-sale" strokeWidth={1.5} />
      <h1 className="font-display mt-4 text-4xl">Payment not completed</h1>
      <p className="mt-3 text-muted">{message}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/checkout" className="btn btn-primary">Try again</Link>
        <Link href="/help#contact" className="btn btn-outline">Get help</Link>
      </div>
    </div>
  );
}
