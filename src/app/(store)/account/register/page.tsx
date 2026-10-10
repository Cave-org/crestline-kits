import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { register } from "../actions";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="container-x max-w-md py-14">
      <h1 className="font-display text-5xl">Create account</h1>
      <p className="mt-2 text-muted">Save your details and follow every order.</p>
      <div className="mt-8">
        <AuthForm
          action={register}
          next={next}
          submitLabel="Create account"
          fields={[
            { name: "name", label: "Full name", autoComplete: "name" },
            { name: "email", label: "Email", type: "email", autoComplete: "email" },
            { name: "phone", label: "Phone (optional)", type: "tel", autoComplete: "tel", required: false, placeholder: "024 123 4567" },
            { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" },
          ]}
        />
      </div>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/account/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
