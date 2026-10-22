import type { Metadata } from "next";
import Link from "next/link";
import { deliveryFees, store } from "@/lib/config";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping, returns & refund policy",
  description: `How ${store.name} delivers orders, and how returns, exchanges and refunds work.`,
};

export default function PolicyPage() {
  return (
    <div className="container-x max-w-3xl pt-10">
      <p className="text-[13px] text-muted">Last updated {store.policyUpdated}</p>
      <h1 className="font-display mt-2 text-5xl">Shipping, returns & refunds</h1>
      <p className="mt-4 leading-relaxed text-muted">
        This policy covers every order placed on this website with {store.name}, a football jersey store based in Accra,
        Ghana. If anything here is unclear, contact us at{" "}
        <a className="underline" href={`mailto:${store.email}`}>{store.email}</a> or{" "}
        <a className="underline" href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phone}</a>.
      </p>

      <Section title="1. Processing your order">
        <p>
          We confirm every paid order by email. Most jerseys ship from our stock in Accra and are packed within 1 working
          day of payment.
        </p>
        <p>
          Some jerseys are ordered from our supplier after you buy. If your order includes one of these, we'll tell you by
          email or WhatsApp within 1 working day, and it can add {store.supplierExtraDays} working days to your delivery
          time. If that doesn't suit you, you can cancel for a full refund.
        </p>
        <p>Jerseys with name and number printing take 2–3 extra working days.</p>
      </Section>

      <Section title="2. Delivery in Ghana">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Greater Accra: {formatMoney(deliveryFees["Greater Accra"])}, delivered in 1–2 working days. Free on orders over{" "}
            {formatMoney(store.freeDeliveryThreshold)}.
          </li>
          <li>All other regions: {formatMoney(deliveryFees.default)}, delivered in 2–4 working days.</li>
          <li>Free pickup in Accra: we'll call you when your order is ready to collect.</li>
        </ul>
        <p>Delivery times are counted from when your order is dispatched, not including weekends and public holidays.</p>
      </Section>

      <Section title="3. Delivery outside Ghana">
        <p>
          We deliver to Nigeria and other countries. Delivery isn't charged at checkout. After you order, we'll send you the
          shipping cost and options for your country. Once you've paid for shipping, delivery usually takes{" "}
          {store.internationalDays} working days.
        </p>
        <p>
          If you'd rather not go ahead once you see the shipping cost, tell us and we'll refund your order in full.
          Customs duties or import taxes charged by your country are paid by you.
        </p>
      </Section>

      <Section title="4. Cancellations">
        <p>
          You can cancel an order for a full refund any time before it's dispatched. Contact us with your order number.
          Printed jerseys can only be cancelled before printing starts.
        </p>
        <p>
          If a jersey you ordered turns out to be unavailable, we'll contact you and either offer an alternative or
          refund that item in full.
        </p>
      </Section>

      <Section title="5. Exchanges for size">
        <p>
          You can exchange a jersey for a different size within 7 days of delivery, as long as it's unworn, unwashed,
          unprinted and has its tags attached. Contact us with your order number to arrange it. You cover the cost of
          sending the jersey back; we cover sending the new size.
        </p>
        <p>
          Jerseys printed with a name or number are made for you, so they can't be exchanged or refunded unless they
          arrive faulty or the printing is wrong.
        </p>
      </Section>

      <Section title="6. Damaged, faulty or wrong items">
        <p>
          If your order arrives damaged, faulty, incomplete or isn't what you ordered (including a printing mistake on our
          part), tell us within 48 hours of delivery with your order number and photos. We'll replace the item, or refund
          it in full if a replacement isn't available, and we'll cover any delivery costs.
        </p>
      </Section>

      <Section title="7. How refunds are paid">
        <p>
          Approved refunds are sent back to the Mobile Money wallet or card you paid with, through our payment provider
          Paystack, within 5 working days of approval. Your bank or mobile network may take a few more days to show it.
        </p>
        <p>
          Orders paid from outside Ghana are charged in Ghana cedis, so they're refunded in Ghana cedis too. The amount you
          see may differ slightly from what you paid because of your bank's exchange rate.
        </p>
      </Section>

      <Section title="8. Questions">
        <p>
          Contact us at <a className="underline" href={`mailto:${store.email}`}>{store.email}</a> or{" "}
          <a className="underline" href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phone}</a>. We reply within one
          working day. See also our <Link href="/help" className="underline">help page</Link> and size guide.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}
