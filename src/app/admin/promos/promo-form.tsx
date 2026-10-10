"use client";

import { useActionState, useState } from "react";
import { createPromo } from "../actions";

export function PromoForm() {
  const [state, action, pending] = useActionState(createPromo, undefined);
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  return (
    <form action={action} className="mt-5 rounded-xl bg-white p-5">
      <h2 className="font-semibold">New code</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label>
          <span className="label">Code</span>
          <input name="code" required className="input uppercase" placeholder="MATCHDAY20" />
        </label>
        <label>
          <span className="label">Type</span>
          <select name="type" value={type} onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")} className="input">
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Amount off (GH₵)</option>
          </select>
        </label>
        <label>
          <span className="label">{type === "PERCENT" ? "Percent" : "Amount (GH₵)"}</span>
          <input name="value" required inputMode="decimal" className="input" placeholder={type === "PERCENT" ? "20" : "50"} />
        </label>
        <label>
          <span className="label">Min. spend (GH₵, optional)</span>
          <input name="minSubtotal" inputMode="decimal" className="input" />
        </label>
        <label>
          <span className="label">Max uses (optional)</span>
          <input name="maxUses" type="number" min={1} className="input" />
        </label>
        <label>
          <span className="label">Expires (optional)</span>
          <input name="expiresAt" type="date" className="input" />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button disabled={pending} className="btn btn-primary !py-2.5">{pending ? "Creating…" : "Create code"}</button>
        {state?.error && <p className="text-sm text-sale">{state.error}</p>}
        {state?.ok && <p className="text-sm text-ok">{state.ok}</p>}
      </div>
    </form>
  );
}
