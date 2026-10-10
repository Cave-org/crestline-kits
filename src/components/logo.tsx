import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

// Wordmark files (1200 × 242, transparent):
//   public/wordmark-black.png  black letters, gold dot — for light backgrounds
//   public/wordmark-white.png  white letters, gold dot — for dark backgrounds
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="Crestline Kits home" className={clsx("inline-flex items-center", className)}>
      <Image
        src={light ? "/wordmark-white.png" : "/wordmark-black.png"}
        alt="Crestline"
        width={1200}
        height={242}
        priority
        className="h-6 w-auto md:h-7"
      />
    </Link>
  );
}
