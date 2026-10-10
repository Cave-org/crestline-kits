import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "../product-form";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  const categories = await getCategories();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">← Products</Link>
      <h1 className="mt-3 text-2xl font-semibold">Add product</h1>
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
