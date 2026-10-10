import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { ProductRow } from "@/components/product-row";
import { listProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const suggestions = await listProducts({ featured: true, limit: 8 });
  return (
    <>
      <CartView />
      <ProductRow title="You may also like" href="/shop" products={suggestions} />
    </>
  );
}
