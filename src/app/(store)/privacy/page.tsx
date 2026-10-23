import type { Metadata } from "next";
import { Contact, LegalPage, LegalSection } from "@/components/legal";
import { store } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${store.name} collects, uses and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro={
        <p>
          This policy explains what personal information {store.name} (Accra, Ghana) collects when you use this website,
          why, and what you can do about it. We follow Ghana&apos;s Data Protection Act, 2012 (Act 843). Questions or
          requests: <Contact />.
        </p>
      }
    >
      <LegalSection title="1. What we collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Order details:</strong> your name, email, phone number, delivery address, the items you buy, and any
            name or number you ask us to print.
          </li>
          <li>
            <strong>Account details</strong> (only if you create an account): your name, email, phone number and a
            password. Passwords are stored in scrambled (hashed) form, so we can&apos;t read them.
          </li>
          <li>
            <strong>Payment information:</strong> Paystack handles your payment. We receive the payment reference,
            amount, method (for example Mobile Money or card) and whether it succeeded. We never receive your full card
            number, card security code or Mobile Money PIN.
          </li>
          <li>
            <strong>Your approximate country:</strong> worked out from your internet connection so we can show prices in
            the right currency. We don&apos;t store your exact location.
          </li>
          <li>
            <strong>Messages</strong> you send us by email, phone or WhatsApp.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use it">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To process, deliver and support your orders, including calling or messaging you about delivery.</li>
          <li>To run your account and show your order history.</li>
          <li>To handle exchanges, refunds and questions.</li>
          <li>To prevent fraud and keep the website secure.</li>
          <li>To meet our legal and accounting obligations.</li>
        </ul>
        <p>We don&apos;t sell your personal information, and we don&apos;t send marketing messages unless you ask us to.</p>
      </LegalSection>

      <LegalSection title="3. Who we share it with">
        <p>Only with the services we need to run the store, and only what they need:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Paystack</strong>: to take your payment.</li>
          <li><strong>Delivery riders and couriers</strong>: your name, phone number and address, to deliver your order.</li>
          <li>
            <strong>Our hosting and database providers</strong> (Vercel and Neon): they store the website and its data
            on secure servers, which may be outside Ghana.
          </li>
          <li><strong>Authorities</strong>: only if the law requires it.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Cookies and local storage">
        <p>
          We use one cookie to keep you signed in to your account. Your cart and wishlist are saved in your own browser so
          they&apos;re still there when you come back. We don&apos;t use advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="5. How long we keep it">
        <p>
          We keep order records for as long as we need them for accounting and tax purposes, usually up to 6 years.
          Account details are kept until you ask us to delete your account.
        </p>
      </LegalSection>

      <LegalSection title="6. How we protect it">
        <p>
          The website uses encrypted (HTTPS) connections, passwords are hashed, and only the store owner can access order
          and customer details through a password-protected admin area.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          You can ask us for a copy of the personal information we hold about you, ask us to correct it, or ask us to
          delete it (unless we must keep it, for example for an order record). Contact us at <Contact /> and we&apos;ll reply
          within 7 working days. You can also contact Ghana&apos;s Data Protection Commission if you&apos;re unhappy with how we
          handle your data.
        </p>
      </LegalSection>

      <LegalSection title="8. Children">
        <p>This website is not intended for children under 13, and we don&apos;t knowingly collect their information.</p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>We may update this policy from time to time. The date at the top shows the latest version.</p>
      </LegalSection>
    </LegalPage>
  );
}
