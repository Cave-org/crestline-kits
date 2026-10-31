"use client";

import { useEffect, useRef, useState } from "react";
import { ADMIN_IDLE_SECONDS } from "@/lib/session-config";

const WARN_BEFORE = 2 * 60 * 1000; // show the warning 2 minutes before signing out
const PING_EVERY = 2 * 60 * 1000; // while you're active, renew the session at most every 2 minutes

/**
 * Signs the admin out after ADMIN_IDLE_SECONDS without any clicks, typing or scrolling.
 * While you're working (even just filling in a long form), it quietly renews the session.
 */
export function AdminIdleGuard() {
  const idleMs = ADMIN_IDLE_SECONDS * 1000;
  const lastActivity = useRef(Date.now());
  const lastPing = useRef(Date.now()); // loading the page already renewed the session
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const signOut = () => {
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = `/account/login?next=${next}&expired=1`;
    };

    const ping = async () => {
      lastPing.current = Date.now();
      try {
        const res = await fetch("/api/admin/ping", { method: "POST", cache: "no-store" });
        if (res.status === 401) signOut();
      } catch {
        // offline: try again on the next activity
      }
    };

    const onActivity = () => {
      lastActivity.current = Date.now();
      if (Date.now() - lastPing.current > PING_EVERY) ping();
    };

    const events = ["pointerdown", "keydown", "scroll", "touchstart", "input", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }));

    const tick = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      if (idle >= idleMs) return signOut();
      setSecondsLeft(idle >= idleMs - WARN_BEFORE ? Math.ceil((idleMs - idle) / 1000) : null);
    }, 1000);

    // Coming back to a tab that was hidden for a long time
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastActivity.current >= idleMs) signOut();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }));
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [idleMs]);

  if (secondsLeft === null) return null;
  const m = Math.floor(secondsLeft / 60);
  const s = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" role="alertdialog" aria-labelledby="idle-title">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
        <h2 id="idle-title" className="text-lg font-semibold">Still there?</h2>
        <p className="mt-2 text-sm text-muted">
          For security, you&apos;ll be signed out of the admin in{" "}
          <strong className="tabular-nums text-ink">{m}:{s}</strong> because you haven&apos;t been active.
        </p>
        <button
          className="btn btn-primary mt-5 w-full"
          onClick={() => {
            // The click counts as activity, which renews the session
            lastActivity.current = Date.now();
            setSecondsLeft(null);
          }}
        >
          Stay signed in
        </button>
      </div>
    </div>
  );
}
