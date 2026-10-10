import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { promoCodes } from "@/db/schema";
import { formatDate, formatMoney } from "@/lib/format";
import { deletePromo, togglePromo } from "../actions";
import { PromoForm } from "./promo-form";

export const metadata = { title: "Promo codes" };

export default async function AdminPromos() {
  const list = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold">Promo codes</h1>
      <PromoForm />
      <div className="mt-6 overflow-x-auto rounded-xl bg-white">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No promo codes yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Used</th>
                <th className="px-5 py-3 font-medium">Expires</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-mono font-semibold">{p.code}</td>
                  <td className="px-5 py-3">
                    {p.type === "PERCENT" ? `${p.value}% off` : `${formatMoney(p.value)} off`}
                    {p.minSubtotal > 0 && <p className="text-[12px] text-muted">Min. spend {formatMoney(p.minSubtotal)}</p>}
                  </td>
                  <td className="px-5 py-3 tabular-nums">{p.usedCount}{p.maxUses != null && ` / ${p.maxUses}`}</td>
                  <td className="px-5 py-3 text-muted">{p.expiresAt ? formatDate(p.expiresAt) : "Never"}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <form action={togglePromo}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${p.active ? "bg-ok/10 text-ok" : "bg-tile text-muted"}`}>
                          {p.active ? "Active" : "Paused"}
                        </button>
                      </form>
                      <form action={deletePromo}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-full px-2.5 py-1 text-[12px] text-sale hover:bg-sale/10">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
