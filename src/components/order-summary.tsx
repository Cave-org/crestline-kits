import { ProductImage } from "./product-image";
import { formatMoney } from "@/lib/format";
import type { Order, OrderItem } from "@/db/schema";

export function OrderSummary({ order }: { order: Order & { items: OrderItem[] } }) {
  const fmt = (n: number) => formatMoney(n, order.currency);
  return (
    <div className="rounded-xl border border-line p-5 md:p-6">
      <ul className="space-y-4">
        {order.items.map((i) => (
          <li key={i.id} className="flex gap-3">
            <ProductImage src={i.image} alt={i.productName} sizes="64px" className="h-16 w-16 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">{i.productName}</p>
              <p className="text-[13px] text-muted">
                Size {i.size} · Qty {i.quantity}
                {(i.customName || i.customNumber) && ` · Printing: ${[i.customName, i.customNumber].filter(Boolean).join(" ")}`}
              </p>
            </div>
            <p className="text-sm font-medium">{fmt((i.unitPrice + i.customizationFee) * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
        <Line label="Subtotal" value={fmt(order.subtotal)} />
        {order.customizationTotal > 0 && <Line label="Printing" value={fmt(order.customizationTotal)} />}
        <Line
          label="Delivery"
          value={order.country !== "GH" ? "Arranged separately" : order.deliveryFee === 0 ? "Free" : fmt(order.deliveryFee)}
        />
        {order.discount > 0 && <Line label={`Discount${order.promoCode ? ` (${order.promoCode})` : ""}`} value={`- ${fmt(order.discount)}`} />}
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{fmt(order.total)}</dd>
        </div>
        {order.currency !== "GHS" && order.chargeAmount != null && (
          <p className="text-right text-[12px] text-muted">Charged as {formatMoney(order.chargeAmount)}</p>
        )}
      </dl>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export const statusStyles: Record<string, string> = {
  PENDING: "bg-tile text-muted",
  PAID: "bg-ok/10 text-ok",
  PROCESSING: "bg-accent/20 text-ink",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-ok text-white",
  CANCELLED: "bg-sale/10 text-sale",
};

export const statusLabels: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  PROCESSING: "Being prepared",
  SHIPPED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-medium ${statusStyles[status] ?? ""}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}
