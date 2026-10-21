"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  key: string; // variant + printing, so the same shirt with different names stays separate
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string | null;
  price: number; // GH₵ price in pesewas, a display snapshot — the server reprices at checkout
  priceUsd?: number | null; // USD price in cents for buyers outside Ghana/Nigeria (empty = converted)
  quantity: number;
  customName?: string | null;
  customNumber?: string | null;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  promoCode: string | null;
  add: (item: Omit<CartItem, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setPromo: (code: string | null) => void;
};

export const cartKey = (variantId: string, name?: string | null, number?: string | null) =>
  [variantId, (name ?? "").toUpperCase(), number ?? ""].join("|");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      add: (item) =>
        set((s) => {
          const key = cartKey(item.variantId, item.customName, item.customNumber);
          const existing = s.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.maxStock, 20) } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, key, quantity: Math.min(item.quantity, item.maxStock, 20) }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock, 20)) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], promoCode: null }),
      setPromo: (promoCode) => set({ promoCode }),
    }),
    { name: "crestline-cart", version: 1 },
  ),
);
