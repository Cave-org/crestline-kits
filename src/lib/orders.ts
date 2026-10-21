import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { orders, productVariants, promoCodes } from "@/db/schema";

/**
 * Marks an order as paid exactly once, then takes the stock and counts the promo use.
 * Safe to call from both the payment redirect page and the webhook.
 */
export async function markOrderPaid(
  reference: string,
  amount: number,
  currency: string,
  channel: string,
  paidAt?: string | null,
) {
  return db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({
      where: eq(orders.paymentRef, reference),
      with: { items: true },
    });
    if (!order) return { ok: false as const, reason: "Order not found" };
    if (order.status !== "PENDING") return { ok: true as const, order, alreadyPaid: true };
    // Paystack always charges in GH₵ (see chargeAmount on the order)
    if (currency !== "GHS" || amount !== (order.chargeAmount ?? order.total))
      return { ok: false as const, reason: "Amount paid does not match the order" };

    const claimed = await tx
      .update(orders)
      .set({ status: "PAID", paymentChannel: channel, paidAt: paidAt ? new Date(paidAt) : new Date() })
      .where(and(eq(orders.id, order.id), eq(orders.status, "PENDING")))
      .returning({ id: orders.id });
    if (claimed.length === 0) return { ok: true as const, order, alreadyPaid: true };

    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx
        .update(productVariants)
        .set({ stock: sql`greatest(${productVariants.stock} - ${item.quantity}, 0)` })
        .where(eq(productVariants.id, item.variantId));
    }

    if (order.promoCode) {
      await tx
        .update(promoCodes)
        .set({ usedCount: sql`${promoCodes.usedCount} + 1` })
        .where(eq(promoCodes.code, order.promoCode));
    }
    return { ok: true as const, order: { ...order, status: "PAID" as const }, alreadyPaid: false };
  });
}
