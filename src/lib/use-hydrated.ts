"use client";

import { useSyncExternalStore } from "react";

/** True once the page is running in the browser, so saved cart data can be shown without hydration mismatches. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
