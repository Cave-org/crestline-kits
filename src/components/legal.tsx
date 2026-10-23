import { store } from "@/lib/config";

/** Layout for the policy pages (terms, privacy, shipping & returns). */
export function LegalPage({ title, intro, children }: { title: string; intro: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl pt-10">
      <p className="text-[13px] text-muted">Last updated {store.policyUpdated}</p>
      <h1 className="font-display mt-2 text-5xl">{title}</h1>
      <div className="mt-4 leading-relaxed text-muted">{intro}</div>
      {children}
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export function Contact() {
  return (
    <>
      <a className="underline" href={`mailto:${store.email}`}>{store.email}</a> or{" "}
      <a className="underline" href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phone}</a>
    </>
  );
}
