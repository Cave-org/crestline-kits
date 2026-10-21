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
import { ipCountryFrom, paymentChannels } from "@/lib/market";
import { countryCodes } from "@/lib/countries";

const body = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    name: z.string().trim().min(2, "Enter your full name").max(80),
    phone: z.string().trim().max(20),
    country: z.string().refine((c) => countryCodes.includes(c), "Choose your country"),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    region: z.string().trim().max(60),
    city: z.string().trim().max(60),
    address: z.string().trim().max(200),
    notes: z.string().trim().max(300).optional(),
    promoCode: z.string().trim().max(40).nullable().optional(),
    lines: z.array(cartLineSchema).min(1, "Your cart is empty").max(50),
  })
  .superRefine((v, ctx) => {
    const ghana = v.country === "GH";
    if (ghana && !/^(\+?233|0)\d{9}$/.test(v.phone))
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a Ghana phone number, like 024 123 4567" });
    if (!ghana && !/^\+\d{7,15}$/.test(v.phone))
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter your phone number with the country code, like +234 803 123 4567" });
    if (ghana && !(regions as readonly string[]).includes(v.region))
      ctx.addIssue({ code: "custom", path: ["region"], message: "Choose your region" });
    if (!ghana && v.deliveryMethod === "pickup")
      ctx.addIssue({ code: "custom", path: ["deliveryMethod"], message: "Pickup is only available in Ghana" });
    if (v.deliveryMethod === "delivery") {
      if (v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter your town or city" });
      if (v.address.length < 5)
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: ghana ? "Enter a delivery address or GhanaPost GPS" : "Enter your delivery address",
        });
      if (!ghana && v.region.length < 2)
        ctx.addIssue({ code: "custom", path: ["region"], message: "Enter your state, province or region" });
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
      country: input.country,
      ipCountry: ipCountryFrom(req.headers.get("x-vercel-ip-country")),
      deliveryMethod: input.deliveryMethod,
      region: input.region,
    });
    if (priced.chargeAmount < 100) {
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
          country: priced.country,
          currency: priced.currency,
          city: input.deliveryMethod === "pickup" ? "Pickup" : input.city,
          address: input.deliveryMethod === "pickup" ? "Store pickup" : input.address,
          notes: input.notes || null,
          subtotal: priced.subtotal,
          customizationTotal: priced.customizationTotal,
          deliveryFee: priced.deliveryFee,
          discount: priced.discount,
          total: priced.total,
          chargeAmount: priced.chargeAmount,
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
        amount: priced.chargeAmount,
        channels: paymentChannels(priced.country),
        reference,
        // Paystack adds ?reference=… to this URL itself
        callbackUrl: `${site}/checkout/complete`,
        metadata: { order_number: order.number, customer_name: input.name, phone: input.phone, country: priced.country },
      });
      return NextResponse.json({ authorizationUrl: payment.authorization_url, orderNumber: order.number });
    } catch (e) {
      await db.update(orders).set({ status: "CANCELLED" }).where(eq(orders.id, order.id));
      console.error("Paystack init failed", e);
      return NextResponse.json(
        {
          error:
            priced.currency === "USD"
              ? "We couldn't start the card payment. Please try again in a moment, or contact us to order."
              : "We couldn't start the payment. Please try again in a moment.",
        },
        { status: 502 },
      );
    }
  } catch (e) {
    if (e instanceof PricingError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
