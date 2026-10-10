"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(store)/account/actions";

type Field = { name: string; label: string; type?: string; autoComplete?: string; required?: boolean; placeholder?: string };

export function AuthForm({
  action,
  fields,
  submitLabel,
  next,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {fields.map((f) => (
        <div key={f.name}>
          <label className="label" htmlFor={f.name}>{f.label}</label>
          <input
            id={f.name}
            name={f.name}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            required={f.required ?? true}
            placeholder={f.placeholder}
            className="input"
          />
        </div>
      ))}
      {state?.error && (
        <p className="rounded-md bg-sale/10 p-3 text-sm text-sale" role="alert">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="btn btn-primary w-full">
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}
