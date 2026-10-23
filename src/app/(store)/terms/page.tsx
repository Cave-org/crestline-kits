import type { Metadata } from "next";
import Link from "next/link";
import { Contact, LegalPage, LegalSection } from "@/components/legal";
import { store } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The terms for buying from ${store.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      intro={
        <p>
          These terms apply when you use this website or buy from {store.name}, an online football jersey store run by
          Albert Quaye in Accra, Ghana (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By placing an order or creating an account, you agree to them.
          Questions? Contact us at <Contact />.
        </p>
      }
    >
      <LegalSection title="1. Using the website">
        <p>
          You must be at least 18, or have a parent or guardian&apos;s permission, to place an order. You agree to give
          accurate details (name, phone number, email and delivery address) so we can deliver your order.
        </p>
        <p>
          Don&apos;t misuse the website. That includes trying to get into other people&apos;s accounts, interfering with how
          the site works, or placing orders you don&apos;t intend to pay for.
        </p>
      </LegalSection>

      <LegalSection title="2. Your account">
        <p>
          You don&apos;t need an account to buy. If you create one, keep your password private: you&apos;re responsible for
          orders placed from your account. Tell us straight away if you think someone else has used it. We may close
          accounts that break these terms.
        </p>
      </LegalSection>

      <LegalSection title="3. Products and descriptions">
        <p>
          We sell football jerseys and sportswear. Our jerseys are <strong>fan versions</strong> unless a listing clearly
          says otherwise. We describe and photograph every product as accurately as we can, but colours can look slightly
          different on different screens.
        </p>
        <p>
          Some jerseys are held in stock in Accra and some are ordered from our supplier after you buy. Stock shown on the
          site is updated regularly but can occasionally be wrong. If something you ordered isn&apos;t available, we&apos;ll
          contact you to offer an alternative or a full refund.
        </p>
      </LegalSection>

      <LegalSection title="4. Prices and payment">
        <p>
          Prices are shown in Ghana cedis (GH₵) for shoppers in Ghana and Nigeria, and in US dollars for shoppers
          elsewhere. The price you pay is the one shown at checkout when you place your order. If we&apos;ve made an obvious
          pricing mistake, we&apos;ll tell you and you can choose to cancel for a full refund.
        </p>
        <p>
          Payments are processed securely by <strong>Paystack</strong>. In Ghana you can pay with Mobile Money (MTN,
          Telecel, AirtelTigo) or a bank card; elsewhere by Visa or Mastercard. All card payments are charged in Ghana
          cedis, so if you pay from abroad your bank converts the amount at its own rate. We never see or store your card
          details or Mobile Money PIN.
        </p>
      </LegalSection>

      <LegalSection title="5. Orders">
        <p>
          Your order is confirmed once your payment goes through and you receive an order number. We may cancel and fully
          refund an order if the item is unavailable, the price was clearly wrong, or we suspect fraud.
        </p>
        <p>
          Name and number printing is made to your instructions, so please check spelling before you pay. We aren&apos;t
          responsible for mistakes in the name or number you enter.
        </p>
      </LegalSection>

      <LegalSection title="6. Delivery, returns and refunds">
        <p>
          Delivery times and fees, exchanges, cancellations and refunds are covered in our{" "}
          <Link href="/shipping-and-returns" className="underline">shipping, returns &amp; refund policy</Link>, which is part
          of these terms.
        </p>
      </LegalSection>

      <LegalSection title="7. Promo codes">
        <p>
          Promo codes can only be used as described when they&apos;re issued, can&apos;t be exchanged for cash, and may expire
          or have a usage limit. One code per order.
        </p>
      </LegalSection>

      <LegalSection title="8. Team names and logos">
        <p>
          Club and national team names, crests and kit designs belong to their owners. {store.name} is an independent
          retailer and isn&apos;t affiliated with, sponsored by or endorsed by any club, federation or kit manufacturer.
        </p>
      </LegalSection>

      <LegalSection title="9. Liability">
        <p>
          We&apos;re responsible for delivering the products you order as described. We aren&apos;t responsible for losses
          we couldn&apos;t reasonably foresee, or for delays caused by events outside our control (such as courier, customs
          or network outages). Nothing in these terms limits any rights you have under Ghanaian consumer law.
        </p>
      </LegalSection>

      <LegalSection title="10. Your data">
        <p>
          How we collect and use your personal information is explained in our{" "}
          <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes and governing law">
        <p>
          We may update these terms from time to time; the date at the top shows the latest version. Orders are covered
          by the terms in place when they were placed. These terms are governed by the laws of the Republic of Ghana.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          {store.name}, Accra, Ghana · <Contact />
        </p>
      </LegalSection>
    </LegalPage>
  );
}
