"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Drawer } from "./drawer";
import { activeCount, filtersToQuery, type Facets, type Filters, type SortKey } from "@/lib/shop-filters";

/* ---------- shared state: current filters + "is the page updating" ---------- */

type Ctx = {
  filters: Filters;
  setFilters: (next: Filters) => void;
  pending: boolean;
};
const ShopCtx = createContext<Ctx | null>(null);
const useShop = () => {
  const c = useContext(ShopCtx);
  if (!c) throw new Error("useShop must be inside <ShopShell>");
  return c;
};

export function ShopShell({ initial, children }: { initial: Filters; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  // Local copy so checkboxes respond instantly while the new results load
  const [filters, setLocal] = useState(initial);
  const key = JSON.stringify(initial);
  useEffect(() => setLocal(JSON.parse(key)), [key]);

  const setFilters = useCallback(
    (next: Filters) => {
      setLocal(next);
      // On a category page (/shop/retro), stay there while that category is still ticked
      const pageCat = pathname.startsWith("/shop/") ? pathname.slice(6) : null;
      const stay = pageCat && next.cat.includes(pageCat);
      const base = stay ? pathname : "/shop";
      const qs = filtersToQuery(stay ? { ...next, cat: next.cat.filter((c) => c !== pageCat) } : next);
      // Next.js ignores replace(samePath, { scroll: false }) when the query becomes empty, so drop the option then
      startTransition(() => (qs ? router.replace(`${base}?${qs}`, { scroll: false }) : router.replace(base)));
    },
    [router, pathname],
  );

  return <ShopCtx.Provider value={{ filters, setFilters, pending }}>{children}</ShopCtx.Provider>;
}

/** Fades the product grid while new results load. */
export function ResultsArea({ children }: { children: React.ReactNode }) {
  const { pending } = useShop();
  return (
    <div aria-busy={pending} className={clsx("transition-opacity duration-150", pending && "pointer-events-none opacity-50")}>
      {children}
    </div>
  );
}

/* ---------- helpers ---------- */

type ListKey = "cat" | "kit" | "team" | "size" | "price";

function useToggle() {
  const { filters, setFilters } = useShop();
  return {
    filters,
    toggle: (k: ListKey, v: string) => {
      const cur = filters[k];
      setFilters({ ...filters, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
    },
    flag: (k: "stock" | "sale" | "isNew") => setFilters({ ...filters, [k]: !filters[k] }),
    clearAll: () =>
      setFilters({ ...filters, cat: [], kit: [], team: [], size: [], price: [], stock: false, sale: false, isNew: false }),
    setSort: (sort: SortKey) => setFilters({ ...filters, sort }),
  };
}

/* ---------- filter panel (sidebar on desktop, drawer on phones) ---------- */

function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-4 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold uppercase tracking-wide">
        {title}
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function CheckRow({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  const disabled = count === 0 && !checked;
  return (
    <label className={clsx("flex cursor-pointer items-center gap-3 py-1.5 text-sm", disabled && "cursor-default opacity-40")}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span
        className={clsx(
          "grid h-[18px] w-[18px] shrink-0 place-items-center rounded border transition peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30",
          checked ? "border-ink bg-ink text-white" : "border-line bg-white",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-[12px] tabular-nums text-muted">{count}</span>
    </label>
  );
}

function TeamList({ options }: { options: Facets["team"] }) {
  const { filters, toggle } = useToggle();
  const [all, setAll] = useState(false);
  const [q, setQ] = useState("");
  const sorted = [...options].sort((a, b) => +filters.team.includes(b.value) - +filters.team.includes(a.value) || b.count - a.count || a.label.localeCompare(b.label));
  const shown = sorted.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  const visible = all || q ? shown : shown.slice(0, 8);
  return (
    <>
      {options.length > 8 && (
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a team…" aria-label="Find a team" className="input mb-2 !py-2 text-sm" />
      )}
      {visible.map((o) => (
        <CheckRow key={o.value} label={o.label} count={o.count} checked={filters.team.includes(o.value)} onChange={() => toggle("team", o.value)} />
      ))}
      {!q && shown.length > 8 && (
        <button onClick={() => setAll(!all)} className="mt-1 text-[13px] underline underline-offset-4">
          {all ? "Show fewer" : `Show all ${shown.length} teams`}
        </button>
      )}
    </>
  );
}

export function FilterPanel({ facets }: { facets: Facets }) {
  const { filters, toggle, flag } = useToggle();
  return (
    <div>
      <Group title="Category">
        {facets.cat.map((o) => (
          <CheckRow key={o.value} label={o.label} count={o.count} checked={filters.cat.includes(o.value)} onChange={() => toggle("cat", o.value)} />
        ))}
      </Group>
      <Group title="Kit">
        {facets.kit.map((o) => (
          <CheckRow key={o.value} label={o.label} count={o.count} checked={filters.kit.includes(o.value)} onChange={() => toggle("kit", o.value)} />
        ))}
      </Group>
      <Group title="Size">
        <div className="grid grid-cols-5 gap-2">
          {facets.size.map((o) => {
            const on = filters.size.includes(o.value);
            const disabled = o.count === 0 && !on;
            return (
              <button
                key={o.value}
                type="button"
                disabled={disabled}
                aria-pressed={on}
                onClick={() => toggle("size", o.value)}
                className={clsx(
                  "h-10 rounded-md border text-[13px] transition",
                  on ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                  disabled && "cursor-not-allowed opacity-35 hover:border-line",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-muted">Shows jerseys in stock in that size.</p>
      </Group>
      <Group title="Price">
        {facets.price.map((o) => (
          <CheckRow key={o.value} label={o.label} count={o.count} checked={filters.price.includes(o.value)} onChange={() => toggle("price", o.value)} />
        ))}
      </Group>
      <Group title="Team" defaultOpen={filters.team.length > 0}>
        <TeamList options={facets.team} />
      </Group>
      <Group title="More">
        <CheckRow label="In stock only" count={facets.stockCount} checked={filters.stock} onChange={() => flag("stock")} />
        <CheckRow label="On sale" count={facets.saleCount} checked={filters.sale} onChange={() => flag("sale")} />
      </Group>
    </div>
  );
}

/* ---------- active filter chips ---------- */

export function ActiveChips({ facets }: { facets: Facets }) {
  const { filters, toggle, flag, clearAll } = useToggle();
  const label = (k: ListKey, v: string) => facets[k].find((o) => o.value === v)?.label ?? v;
  const chips: { key: string; text: string; remove: () => void }[] = [
    ...(["cat", "kit", "size", "price", "team"] as const).flatMap((k) =>
      filters[k].map((v) => ({ key: k + v, text: k === "size" ? `Size ${v}` : label(k, v), remove: () => toggle(k, v) })),
    ),
    ...(filters.stock ? [{ key: "stock", text: "In stock", remove: () => flag("stock") }] : []),
    ...(filters.sale ? [{ key: "sale", text: "On sale", remove: () => flag("sale") }] : []),
    ...(filters.isNew ? [{ key: "new", text: "New arrivals", remove: () => flag("isNew") }] : []),
  ];
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={c.remove}
          className="inline-flex items-center gap-1.5 rounded-full bg-tile py-1.5 pl-3 pr-2 text-[13px] hover:bg-line"
          aria-label={`Remove filter: ${c.text}`}
        >
          {c.text}
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
      <button onClick={clearAll} className="px-1 text-[13px] underline underline-offset-4">
        Clear all
      </button>
    </div>
  );
}

/* ---------- sort ---------- */

const sortLabels: Record<SortKey, string> = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  name: "Name",
};

export function SortMenu() {
  const { filters, setSort } = useToggle();
  return (
    <label className="flex items-center gap-2 text-[13px]">
      <span className="hidden text-muted sm:inline">Sort</span>
      <select
        value={filters.sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        aria-label="Sort products"
        className="rounded-md border border-line bg-white px-2.5 py-2 text-[13px] text-ink outline-none focus:border-ink"
      >
        {(Object.keys(sortLabels) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            {sortLabels[k]}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- phones: Filters button + drawer ---------- */

export function MobileFilters({ facets, resultCount }: { facets: Facets; resultCount: number }) {
  const { filters, pending } = useShop();
  const { clearAll } = useToggle();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const n = activeCount(filters);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-line px-3.5 py-2 text-[13px] font-medium hover:border-ink lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">{n}</span>}
      </button>
      <Drawer open={open} onClose={close} label="Filters">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
          <span className="font-display text-2xl">Filters</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterPanel facets={facets} />
        </div>
        <div className="flex gap-3 border-t border-line bg-white p-4">
          <button onClick={clearAll} disabled={n === 0} className="btn btn-outline flex-1 !px-3">
            Clear
          </button>
          <button onClick={close} className="btn btn-primary flex-[2]">
            {pending ? "Updating…" : `Show ${resultCount} ${resultCount === 1 ? "jersey" : "jerseys"}`}
          </button>
        </div>
      </Drawer>
    </>
  );
}
