import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <CheckoutForm
      defaults={{ email: user?.email ?? "", name: user?.name ?? "", phone: user?.phone ?? "" }}
      signedIn={!!user}
    />
  );
}
