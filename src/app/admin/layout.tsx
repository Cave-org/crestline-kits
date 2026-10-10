import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { AdminNav } from "./nav";
import { logout } from "../(store)/account/actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-tile lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Logo />
          <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Admin</span>
        </div>
        <AdminNav />
        <div className="hidden px-5 py-6 text-sm lg:block">
          <p className="truncate text-muted">{admin.email}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" className="underline underline-offset-4">View store</Link>
            <form action={logout}>
              <button className="underline underline-offset-4">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 p-4 md:p-8">{children}</div>
    </div>
  );
}
