import type { Metadata } from "next";
import { ShopView, type ShopSearchParams } from "@/components/shop-view";

export const metadata: Metadata = { title: "Shop all jerseys" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  return <ShopView searchParams={await searchParams} />;
}
