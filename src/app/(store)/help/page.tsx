import type { Metadata } from "next";
import Link from "next/link";
import { deliveryFees, store } from "@/lib/config";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Help, delivery & returns" };

const sizes = [
  ["S", "88–94", "68"],
  ["M", "94–100", "70"],
  ["L", "100–106", "72"],
  ["XL", "106–112", "74"],
  ["XXL", "112–120", "76"],
];

export default function HelpPage() {
  return (
    <div className="container-x max-w-3xl pt-10">
      <h1 className="font-display text-5xl">Help</h1>

      <Section id="delivery" title="Delivery">
        <p>
          Greater Accra: {formatMoney(deliveryFees["Greater Accra"])}, delivered in 1–2 working days, and free on orders
          over {formatMoney(store.freeDeliveryThreshold)}.
        </p>
        <p>All other regions: {formatMoney(deliveryFees.default)}, delivered in 2–4 working days.</p>
        <p>You can also choose free pickup at checkout. We'll call you when your order is ready.</p>
        <p>
          <strong>Outside Ghana:</strong> choose your country at checkout and pay for your jerseys (in GH₵ for Nigeria, in
          US dollars everywhere else). Delivery isn't charged at checkout. We'll contact you by email or WhatsApp with the
          shipping cost and options for your country before we send your order.
        </p>
      </Section>

      <Section id="payment" title="Payment">
        <p>
          In Ghana we take Mobile Money (MTN MoMo, Telecel Cash and AirtelTigo Money) and bank cards through Paystack. For
          Mobile Money you'll get a prompt on your phone to approve the payment. Outside Ghana, pay by Visa or Mastercard.
          We never see or store your PIN or card details.
        </p>
      </Section>

      <Section id="printing" title="Name & number printing">
        <p>
          Add any name (up to 14 letters) and number (0–99) to a matchday jersey for {formatMoney(store.customizationFee)} (
          {formatMoney(store.customizationFeeUsd, "USD")} outside Ghana and Nigeria).
          Printed orders take 2–3 extra days. Printed shirts are made for you, so they can't be exchanged.
        </p>
      </Section>

      <Section id="returns" title="Returns & exchanges">
        <p>
          Wrong size? Exchange unworn, unprinted jerseys with tags attached within 7 days of delivery. Contact us with your
          order number to arrange it. If an item arrives damaged, tell us within 48 hours and we'll replace it.
        </p>
        <p>
          Full details are in our{" "}
          <Link href="/shipping-and-returns" className="underline">shipping, returns & refund policy</Link>.
        </p>
      </Section>

      <Section id="sizing" title="Size guide">
        <p>Measurements in centimetres. Jerseys are a regular fit, so take your usual size.</p>
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-tile">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Size</th>
                <th className="px-4 py-2.5 font-semibold">Chest</th>
                <th className="px-4 py-2.5 font-semibold">Length</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map(([s, chest, len]) => (
                <tr key={s} className="border-t border-line">
                  <td className="px-4 py-2.5 font-medium text-ink">{s}</td>
                  <td className="px-4 py-2.5">{chest}</td>
                  <td className="px-4 py-2.5">{len}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="contact" title="Contact us">
        <p>
          Email <a className="underline" href={`mailto:${store.email}`}>{store.email}</a> or call{" "}
          <a className="underline" href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phone}</a>. We reply within one
          working day.
        </p>
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-line py-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}
