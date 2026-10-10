import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productVariants } from "@/db/schema";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "../product-form";
import { deleteProduct } from "../../actions";

export const metadata = { title: "Edit product" };

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    db.query.products.findFirst({
      where: eq(products.id, id),
      with: { variants: { orderBy: asc(productVariants.sortOrder) } },
    }),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">← Products</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <Link href={`/product/${product.slug}`} target="_blank" className="text-sm underline underline-offset-4">
          View in store
        </Link>
      </div>
      {saved && <p className="mt-3 rounded-md bg-ok/10 p-3 text-sm text-ok">Product created.</p>}
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        product={{
          ...product,
          stock: Object.fromEntries(product.variants.map((v) => [v.size, v.stock])),
        }}
      />
      <form action={deleteProduct} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={product.id} />
        <p className="text-sm text-muted">
          Deleting removes this product from the store. Past orders keep their details. To pause sales instead, untick
          “Visible in store”.
        </p>
        <button className="btn mt-3 border border-sale bg-white text-sale hover:bg-sale/5">Delete product</button>
      </form>
    </div>
  );
}
