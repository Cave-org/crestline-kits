"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { X } from "lucide-react";

/**
 * Slide-in panel rendered at the end of <body> (a portal), so it always covers the
 * whole screen, even when opened from inside the sticky, blurred header.
 * Locks page scroll, closes on Escape, backdrop tap, and page change.
 */
export function Drawer({
  open,
  onClose,
  side = "left",
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  label: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close when the route changes (e.g. after tapping a link)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    closeBtn.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={label}>
      <div
        className={clsx("absolute inset-0 bg-black/45 transition-opacity duration-200", visible ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        className={clsx(
          "absolute inset-y-0 flex w-[86%] max-w-[360px] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-200 ease-out",
          side === "left" ? "left-0" : "right-0",
          visible ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          ref={closeBtn}
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full hover:bg-tile"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
