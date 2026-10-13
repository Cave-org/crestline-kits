"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Search, X } from "lucide-react";

export type StatusCounts = Record<"all" | "live" | "hidden" | "low" | "out" | "featured" | "sale", number>;

const statusTabs: { value: keyof StatusCounts; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "hidden", label: "Hidden" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Sold out" },
  { value: "featured", label: "Featured" },
  { value: "sale", label: "On sale" },
];

const sortOptions = [
  { value: "name", label: "Name A–Z" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "stock-asc", label: "Stock: lowest first" },
  { value: "stock-desc", label: "Stock: highest first" },
];

export function AdminProductFilters({
  categories,
  kits,
  counts,
  children,
}: {
  categories: { slug: string; name: string }[];
  kits: string[];
  counts: StatusCounts;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const skipNext = useRef(true); // don't run the search effect on first load or right after "Clear filters"

  const status = params.get("status") ?? "all";
  const cat = params.get("cat") ?? "";
  const kit = params.get("kit") ?? "";
  const sort = params.get("sort") ?? "name";

  function update(changes: Record<string, string>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (!v || (k === "status" && v === "all") || (k === "sort" && v === "name")) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    // Next.js ignores replace(samePath, { scroll: false }) when the query becomes empty, so drop the option then
    startTransition(() => (s ? router.replace(`${pathname}?${s}`, { scroll: false }) : router.replace(pathname)));
  }

  // Search as you type (short pause so it doesn't reload on every key)
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (q.trim() === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q: q.trim() }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const anyFilter = !!(params.get("q") || cat || kit || status !== "all");

  return (
    <>
      <div className="mt-5 space-y-3 rounded-xl bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, team or season"
              aria-label="Search products"
              className="input !py-2 !pl-9 text-sm"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <div className="grid grid-cols-2 gap-2 md:flex">
            <select value={cat} onChange={(e) => update({ cat: e.target.value })} aria-label="Category" className="input !py-2 text-sm md:!w-auto">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select value={kit} onChange={(e) => update({ kit: e.target.value })} aria-label="Kit" className="input !py-2 text-sm md:!w-auto">
              <option value="">All kits</option>
              {kits.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort" className="input col-span-2 !py-2 text-sm md:!w-auto">
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {statusTabs.map((t) => (
              <button
                key={t.value}
                onClick={() => update({ status: t.value })}
                aria-pressed={status === t.value}
                className={clsx(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px]",
                  status === t.value ? "bg-ink text-white" : "bg-tile hover:bg-line",
                  (t.value === "out" || t.value === "low") && counts[t.value] > 0 && status !== t.value && "text-sale",
                )}
              >
                {t.label}
                <span className={clsx("tabular-nums", status === t.value ? "text-white/70" : "text-muted")}>{counts[t.value]}</span>
              </button>
            ))}
          </div>
          {anyFilter && (
            <button
              onClick={() => {
                if (q) skipNext.current = true;
                setQ("");
                startTransition(() => (sort !== "name" ? router.replace(`${pathname}?sort=${sort}`, { scroll: false }) : router.replace(pathname)));
              }}
              className="shrink-0 self-start text-[13px] underline underline-offset-4 sm:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div aria-busy={pending} className={clsx("transition-opacity duration-150", pending && "opacity-50")}>
        {children}
      </div>
    </>
  );
}
