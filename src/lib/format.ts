/** Amounts are in the smallest unit (pesewas or cents). Pass the order's currency for USD orders. */
export function formatMoney(amount: number, currency: string = "GHS") {
  const n = (amount / 100).toLocaleString(currency === "USD" ? "en-US" : "en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "USD" ? `$${n}` : `GH₵ ${n}`;
}

export function toPesewas(cedis: string | number) {
  const n = typeof cedis === "number" ? cedis : parseFloat(cedis);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function orderNumber() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `CK-${t}${r}`;
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
