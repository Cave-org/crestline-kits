import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView, type ShopSearchParams } from "@/components/shop-view";
import { getCategories } from "@/lib/catalog";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<ShopSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = (await getCategories()).find((x) => x.slug === category);
  return { title: c?.name ?? "Shop", description: c?.blurb ?? undefined };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const exists = (await getCategories()).some((c) => c.slug === category);
  if (!exists) notFound();
  return <ShopView category={category} searchParams={await searchParams} />;
}
