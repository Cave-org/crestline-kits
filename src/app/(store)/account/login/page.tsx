import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { login } from "../actions";
import { ADMIN_IDLE_MINUTES } from "@/lib/session-config";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  const { next, expired } = await searchParams;
  return (
    <div className="container-x max-w-md py-14">
      <h1 className="font-display text-5xl">Sign in</h1>
      <p className="mt-2 text-muted">Track your orders and check out faster.</p>
      {expired && (
        <p className="mt-6 rounded-md bg-accent/15 p-3 text-sm text-ink" role="status">
          You were signed out after {ADMIN_IDLE_MINUTES} minutes without activity. Sign in again to continue.
        </p>
      )}
      <div className="mt-8">
        <AuthForm
          action={login}
          next={next}
          submitLabel="Sign in"
          fields={[
            { name: "email", label: "Email", type: "email", autoComplete: "email" },
            { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
          ]}
        />
      </div>
      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href={`/account/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
