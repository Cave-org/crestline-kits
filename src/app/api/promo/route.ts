import { NextResponse } from "next/server";
import { z } from "zod";
import { cartLineSchema, PricingError, priceCart } from "@/lib/pricing";
import { ipCountryFrom } from "@/lib/market";

const body = z.object({
  code: z.string().trim().min(1).max(40),
  country: z.string().max(2).optional(),
  lines: z.array(cartLineSchema).min(1).max(50),
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a promo code" }, { status: 400 });
  try {
    const priced = await priceCart({
      lines: parsed.data.lines,
      promoCode: parsed.data.code,
      country: parsed.data.country,
      ipCountry: ipCountryFrom(req.headers.get("x-vercel-ip-country")),
    });
    return NextResponse.json({ code: priced.promoCode, discount: priced.discount, subtotal: priced.subtotal });
  } catch (e) {
    if (e instanceof PricingError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
