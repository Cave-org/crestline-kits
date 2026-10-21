import "server-only";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { productVariants, promoCodes } from "@/db/schema";
import { buyerCurrency, ghanaDeliveryFee, ghsToUsd, normalizeCountry, priceFor, printingFee, usdToGhs, type Currency } from "./market";
import { formatMoney } from "./format";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  customName: z
    .string()
    .trim()
    .max(14, "Names can be up to 14 letters")
    .regex(/^[A-Za-z .'-]*$/, "Names can only use letters")
    .optional()
    .nullable(),
  customNumber: z
    .string()
    .trim()
    .regex(/^\d{0,2}$/, "Number must be 0–99")
    .optional()
    .nullable(),
});

export type CartLineInput = z.infer<typeof cartLineSchema>;

export class PricingError extends Error {}

/** Promo minimums and fixed discounts are set in GH₵; for USD orders they're converted. */
export async function validatePromo(code: string | null | undefined, subtotal: number, currency: Currency = "GHS") {
  if (!code?.trim()) return { promo: null, discount: 0 };
  const promo = await db.query.promoCodes.findFirst({
    where: eq(promoCodes.code, code.trim().toUpperCase()),
  });
  if (!promo || !promo.active) throw new PricingError("That promo code isn't valid");
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new PricingError("That promo code has expired");
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses)
    throw new PricingError("That promo code has been fully used");
  const subtotalGhs = currency === "GHS" ? subtotal : usdToGhs(subtotal);
  if (subtotalGhs < promo.minSubtotal) {
    const min = currency === "GHS" ? promo.minSubtotal : ghsToUsd(promo.minSubtotal);
    throw new PricingError(`Spend ${formatMoney(min, currency)} or more to use this code`);
  }
  const fixed = currency === "GHS" ? promo.value : ghsToUsd(promo.value);
  const discount =
    promo.type === "PERCENT"
      ? Math.round((subtotal * Math.min(promo.value, 100)) / 100)
      : Math.min(fixed, subtotal);
  return { promo, discount };
}

/** Recalculates a cart from the database so prices can't be tampered with in the browser. */
export async function priceCart(opts: {
  lines: CartLineInput[];
  promoCode?: string | null;
  country?: string; // delivery country
  ipCountry: string; // where the buyer is, from their connection
  deliveryMethod?: string;
  region?: string;
}) {
  if (opts.lines.length === 0) throw new PricingError("Your cart is empty");
  const country = normalizeCountry(opts.country ?? opts.ipCountry);
  const currency = buyerCurrency(opts.ipCountry, country);

  const variants = await db.query.productVariants.findMany({
    where: inArray(
      productVariants.id,
      opts.lines.map((l) => l.variantId),
    ),
    with: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  // Total quantity requested per variant (the same size can appear twice with different printing)
  const wanted = new Map<string, number>();
  for (const l of opts.lines) wanted.set(l.variantId, (wanted.get(l.variantId) ?? 0) + l.quantity);

  const items = opts.lines.map((line) => {
    const v = byId.get(line.variantId);
    if (!v || v.productId !== line.productId || !v.product.active) {
      throw new PricingError("An item in your cart is no longer available");
    }
    if ((wanted.get(v.id) ?? 0) > v.stock) {
      throw new PricingError(
        v.stock === 0
          ? `${v.product.name} (${v.size}) is sold out`
          : `Only ${v.stock} left of ${v.product.name} (${v.size})`,
      );
    }
    const customName = v.product.allowCustomization ? line.customName?.toUpperCase() || null : null;
    const customNumber = v.product.allowCustomization ? line.customNumber || null : null;
    const customizationFee = customName || customNumber ? printingFee(currency) : 0;
    return {
      productId: v.productId,
      variantId: v.id,
      productName: v.product.name,
      image: v.product.images[0] ?? null,
      size: v.size,
      unitPrice: priceFor(v.product, currency).price,
      quantity: line.quantity,
      customName,
      customNumber,
      customizationFee,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const customizationTotal = items.reduce((s, i) => s + i.customizationFee * i.quantity, 0);
  const { promo, discount } = await validatePromo(opts.promoCode, subtotal, currency);
  // Outside Ghana, delivery is arranged with the buyer after the order, so it isn't charged here
  const deliveryFee = ghanaDeliveryFee(country, currency, opts.deliveryMethod, opts.region, subtotal);
  const total = Math.max(0, subtotal + customizationTotal + deliveryFee - discount);
  const chargeAmount = currency === "GHS" ? total : usdToGhs(total);

  return {
    chargeAmount,
    items,
    subtotal,
    customizationTotal,
    discount,
    deliveryFee,
    total,
    promoCode: promo?.code ?? null,
    country,
    currency,
  };
}
