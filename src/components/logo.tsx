import Link from "next/link";
import clsx from "clsx";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="Crestline Kits home" className={clsx("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <path d="M16 2 L29 7 V16 C29 23 23 28.5 16 30 C9 28.5 3 23 3 16 V7 Z" fill={light ? "#fff" : "#0b0b0b"} />
        <path d="M8 13 L16 9 L24 13 M8 19 L16 15 L24 19" stroke="#f2b705" strokeWidth="2.6" fill="none" strokeLinejoin="round" />
      </svg>
      <span className={clsx("font-display text-[1.45rem] leading-none", light ? "text-white" : "text-ink")}>
        Crestline<span className="text-accent">.</span>
      </span>
    </Link>
  );
}
