import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/db/schema";
import { cartLineSchema, PricingError, priceCart } from "@/lib/pricing";
import { initializeTransaction } from "@/lib/paystack";
import { getSession } from "@/lib/auth";
import { regions } from "@/lib/config";
import { orderNumber } from "@/lib/format";

const body = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    name: z.string().trim().min(2, "Enter your full name").max(80),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?233|0)\d{9}$/, "Enter a Ghana phone number, like 024 123 4567"),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    region: z.enum(regions),
    city: z.string().trim().max(60),
    address: z.string().trim().max(200),
    notes: z.string().trim().max(300).optional(),
    promoCode: z.string().trim().max(40).nullable().optional(),
    lines: z.array(cartLineSchema).min(1, "Your cart is empty").max(50),
  })
  .superRefine((v, ctx) => {
    if (v.deliveryMethod === "delivery") {
      if (v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter your town or city" });
      if (v.address.length < 5)
        ctx.addIssue({ code: "custom", path: ["address"], message: "Enter a delivery address or GhanaPost GPS" });
    }
  });

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Check your details", field: first?.path[0] }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const priced = await priceCart({
      lines: input.lines,
      promoCode: input.promoCode,
      deliveryMethod: input.deliveryMethod,
      region: input.region,
    });
    if (priced.total < 100) {
      return NextResponse.json({ error: "Order total is too low to pay online" }, { status: 400 });
    }

    const session = await getSession();
    const number = orderNumber();
    const reference = `${number}-${crypto.randomUUID().slice(0, 8)}`;

    const order = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(orders)
        .values({
          number,
          userId: session?.userId ?? null,
          email: input.email,
          name: input.name,
          phone: input.phone,
          deliveryMethod: input.deliveryMethod,
          region: input.region,
          city: input.deliveryMethod === "pickup" ? "Pickup" : input.city,
          address: input.deliveryMethod === "pickup" ? "Store pickup" : input.address,
          notes: input.notes || null,
          subtotal: priced.subtotal,
          customizationTotal: priced.customizationTotal,
          deliveryFee: priced.deliveryFee,
          discount: priced.discount,
          total: priced.total,
          promoCode: priced.promoCode,
          paymentRef: reference,
        })
        .returning();
      await tx.insert(orderItems).values(priced.items.map((i) => ({ ...i, orderId: created.id })));
      return created;
    });

    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    try {
      const payment = await initializeTransaction({
        email: input.email,
        amount: priced.total,
        reference,
        // Paystack adds ?reference=… to this URL itself
        callbackUrl: `${site}/checkout/complete`,
        metadata: { order_number: order.number, customer_name: input.name, phone: input.phone },
      });
      return NextResponse.json({ authorizationUrl: payment.authorization_url, orderNumber: order.number });
    } catch (e) {
      await db.update(orders).set({ status: "CANCELLED" }).where(eq(orders.id, order.id));
      console.error("Paystack init failed", e);
      return NextResponse.json(
        { error: "We couldn't start the Mobile Money payment. Please try again in a moment." },
        { status: 502 },
      );
    }
  } catch (e) {
    if (e instanceof PricingError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
