"use client";

import { useActionState, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { kitTypes, sizes, store } from "@/lib/config";

const ghsPerUsd = store.ghsPerUsd;
import { saveProduct } from "../actions";

type ProductInput = {
  id: string;
  name: string;
  team: string;
  season: string | null;
  kitType: string;
  brand: string | null;
  categoryId: string;
  price: number;
  compareAtPrice: number | null;
  priceUsd: number | null;
  compareAtPriceUsd: number | null;
  color: string | null;
  description: string;
  details: string[];
  images: string[];
  featured: boolean;
  isNew: boolean;
  active: boolean;
  allowCustomization: boolean;
  stock: Record<string, number>;
};

const cedis = (p?: number | null) => (p ? (p / 100).toFixed(2) : "");

export function ProductForm({ categories, product }: { categories: { id: string; name: string }[]; product?: ProductInput }) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error);
        break;
      }
      setImages((list) => [...list, json.url]);
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function addLink() {
    const url = link.trim();
    if (!url.startsWith("https://") && !url.startsWith("/")) return setUploadError("Links must start with https://");
    setImages((l) => [...l, url]);
    setLink("");
    setUploadError("");
  }

  return (
    <form action={action} className="mt-6 space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="images" value={images.join("\n")} />

      <Card title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" className="sm:col-span-2">
            <input name="name" required defaultValue={product?.name} className="input" placeholder="Ghana 2026 Home Jersey" />
          </Field>
          <Field label="Team">
            <input name="team" required defaultValue={product?.team} className="input" placeholder="Ghana" />
          </Field>
          <Field label="Season">
            <input name="season" defaultValue={product?.season ?? ""} className="input" placeholder="2026 or 2025/26" />
          </Field>
          <Field label="Category">
            <select name="categoryId" required defaultValue={product?.categoryId ?? ""} className="input">
              <option value="" disabled>Choose…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Kit">
            <select name="kitType" defaultValue={product?.kitType ?? "Home"} className="input">
              {kitTypes.map((k) => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Brand (optional)">
            <input name="brand" defaultValue={product?.brand ?? ""} className="input" />
          </Field>
          <Field label="Colour">
            <input name="color" defaultValue={product?.color ?? ""} className="input" placeholder="White" />
          </Field>
        </div>
      </Card>

      <Card title="Photos">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((src, i) => (
            <div key={src + i} className="relative">
              <ProductImage src={src} alt="" sizes="120px" className="aspect-square rounded-md border border-line" />
              {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-ink px-1.5 text-[10px] text-white">Main</span>}
              <button
                type="button"
                onClick={() => setImages((l) => l.filter((_, x) => x !== i))}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="grid aspect-square place-items-center rounded-md border border-dashed border-muted/50 text-[12px] text-muted hover:border-ink hover:text-ink"
          >
            <span className="flex flex-col items-center gap-1">
              <ImagePlus className="h-5 w-5" />
              {uploading ? "Uploading…" : "Upload"}
            </span>
          </button>
        </div>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
        <div className="mt-3 flex gap-2">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste an image link" className="input !py-2 text-sm" />
          <button type="button" onClick={addLink} className="btn btn-outline !py-2 text-sm">Add</button>
        </div>
        {uploadError && <p className="mt-2 text-sm text-sale">{uploadError}</p>}
        <p className="mt-2 text-[12px] text-muted">The first photo is the main one. Square photos on a light background look best.</p>
      </Card>

      <Card title="Price">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (GH₵)">
            <input name="price" required inputMode="decimal" defaultValue={cedis(product?.price)} className="input" placeholder="550.00" />
          </Field>
          <Field label="Was price (GH₵, optional)">
            <input name="compareAtPrice" inputMode="decimal" defaultValue={cedis(product?.compareAtPrice)} className="input" placeholder="Shows a sale badge" />
          </Field>
        </div>
        <p className="mt-5 text-sm font-medium">International price</p>
        <p className="mt-0.5 text-[12px] text-muted">
          What buyers outside Ghana and Nigeria pay, in US dollars. Leave it empty to convert the GH₵ price automatically
          (at GH₵ {ghsPerUsd} to $1, rounded up to a whole dollar).
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Price (US$)">
            <input name="priceUsd" inputMode="decimal" defaultValue={cedis(product?.priceUsd)} className="input" placeholder="35.00" />
          </Field>
          <Field label="Was price (US$, optional)">
            <input name="compareAtPriceUsd" inputMode="decimal" defaultValue={cedis(product?.compareAtPriceUsd)} className="input" placeholder="Shows a sale badge" />
          </Field>
        </div>
      </Card>

      <Card title="Stock by size">
        <div className="grid grid-cols-5 gap-3">
          {sizes.map((s) => (
            <Field key={s} label={s}>
              <input name={`stock_${s}`} type="number" min={0} defaultValue={product?.stock[s] ?? 0} className="input text-center" />
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Description">
        <Field label="Description">
          <textarea name="description" required rows={4} defaultValue={product?.description} className="input" />
        </Field>
        <Field label="Details (one per line)" className="mt-4">
          <textarea name="details" rows={4} defaultValue={product?.details.join("\n")} className="input" placeholder={"Lightweight, breathable polyester\nMachine wash cold"} />
        </Field>
      </Card>

      <Card title="Settings">
        <div className="grid gap-3 sm:grid-cols-2">
          <Check name="active" label="Visible in store" defaultChecked={product?.active ?? true} />
          <Check name="allowCustomization" label="Allow name & number printing" defaultChecked={product?.allowCustomization ?? true} />
          <Check name="featured" label="Feature on homepage" defaultChecked={product?.featured ?? false} />
          <Check name="isNew" label="Show in New Arrivals" defaultChecked={product?.isNew ?? true} />
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-line bg-tile/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <button disabled={pending || uploading} className="btn btn-primary">
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        {state?.error && <p className="text-sm text-sale" role="alert">{state.error}</p>}
        {state?.ok && <p className="text-sm text-ok">{state.ok}</p>}
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-line p-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-ink" />
      {label}
    </label>
  );
}
