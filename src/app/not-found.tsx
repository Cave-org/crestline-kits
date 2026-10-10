import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <h1 className="font-display text-7xl">Offside</h1>
      <p className="text-muted">That page doesn't exist or has moved.</p>
      <Link href="/shop" className="btn btn-primary">Back to the shop</Link>
    </div>
  );
}
