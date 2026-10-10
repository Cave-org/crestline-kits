import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";
import { isValidWebhook } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/orders";

// Paystack calls this when a payment succeeds, even if the customer closes the browser.
// Set the webhook URL in your Paystack dashboard to: https://YOUR-DOMAIN/api/paystack/webhook
export async function POST(req: Request) {
  const raw = await req.text();
  if (!isValidWebhook(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const event = JSON.parse(raw) as {
    event: string;
    data: { reference: string; amount: number; currency: string; channel: string; paid_at?: string; status: string };
  };

  if (event.event === "charge.success" && event.data.status === "success" && event.data.currency === "GHS") {
    const result = await markOrderPaid(event.data.reference, event.data.amount, event.data.channel, event.data.paid_at);
    if (result.ok && !result.alreadyPaid) revalidateTag(CATALOG_TAG); // stock changed
    if (!result.ok) console.error("Webhook could not mark order paid:", event.data.reference, result.reason);
  }
  return NextResponse.json({ received: true });
}
