import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderDetail } from "@/lib/db/queries/orders";
import { resendOrderEmail, updateOrderStatus } from "@/app/admin/actions/orders";
import { isUuid } from "@/app/admin/actions/shared";
import { allowedNextStatuses, STATUS_LABEL } from "@/lib/order-status";
import { formatMoney } from "@/lib/money";
import { ActionButton } from "@/components/admin/action-button";
import { adminButton } from "@/components/admin/admin-form";

export const metadata = { title: "Order" };

const labelClass = "font-mono text-xs font-semibold uppercase tracking-widest text-muted";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const detail = await getOrderDetail(id);
  if (!detail) notFound();
  const { order, items } = detail;
  const next = allowedNextStatuses(order.status);
  const money = (minor: number) => formatMoney(minor, "en");

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <Link href="/admin/orders" className="text-sm text-navy underline hover:text-accent">
        ← Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
          Order <span className="font-mono">{order.orderNumber}</span>
        </h1>
        <span className="rounded-full border-2 border-navy px-4 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-navy">
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <section aria-labelledby="status" className="flex flex-col gap-3">
        <h2 id="status" className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          Change status
        </h2>
        {next.length === 0 ? (
          <p className="text-sm text-muted">This order is {STATUS_LABEL[order.status].toLowerCase()} and its status can no longer change.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {next.map((status) => (
              <ActionButton
                key={status}
                action={updateOrderStatus.bind(null, order.id, status)}
                confirm={status === "cancelled" ? "Cancel this order?" : undefined}
                className={status === "cancelled" ? undefined : adminButton}
              >
                {status === "cancelled" ? "Cancel order" : `Mark ${STATUS_LABEL[status].toLowerCase()}`}
              </ActionButton>
            ))}
          </div>
        )}
      </section>

      <dl className="grid gap-5 rounded-xl border border-border-strong bg-surface p-5 sm:grid-cols-2">
        <div>
          <dt className={labelClass}>Customer</dt>
          <dd className="mt-1 text-foreground">{order.customerName}</dd>
        </div>
        <div>
          <dt className={labelClass}>Phone</dt>
          <dd className="mt-1">
            <a href={`tel:${order.customerPhone}`} className="font-mono text-navy underline hover:text-accent">
              {order.customerPhone}
            </a>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={labelClass}>Delivery address</dt>
          <dd className="mt-1 whitespace-pre-line text-foreground">{order.deliveryAddress}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={labelClass}>Order notes</dt>
          <dd className="mt-1 whitespace-pre-line text-foreground">{order.notes?.trim() || "None"}</dd>
        </div>
        <div>
          <dt className={labelClass}>Placed</dt>
          <dd className="mt-1 text-foreground">{order.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</dd>
        </div>
        <div>
          <dt className={labelClass}>Payment method</dt>
          <dd className="mt-1 text-foreground">Cash on delivery</dd>
        </div>
        <div>
          <dt className={labelClass}>18+ / research-use acknowledgment</dt>
          <dd className="mt-1 text-foreground">
            Confirmed {order.acknowledgedAt.toISOString().slice(0, 16).replace("T", " ")} UTC
          </dd>
        </div>
        <div>
          <dt className={labelClass}>Customer language</dt>
          <dd className="mt-1 text-foreground">{order.locale === "ar" ? "Arabic" : "English"}</dd>
        </div>
      </dl>

      <section aria-labelledby="items" className="flex flex-col gap-3">
        <h2 id="items" className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          Items
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border-strong">
          <table className="w-full min-w-[30rem] text-sm">
            <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">Product</th>
                <th scope="col" className="px-4 py-3 text-end">Unit price</th>
                <th scope="col" className="px-4 py-3 text-end">Qty</th>
                <th scope="col" className="px-4 py-3 text-end">Line total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border-strong">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-navy">{item.productNameSnapshot}</span>
                    <span className="block font-mono text-xs text-muted">
                      {item.brandNameSnapshot}
                      {item.vialSizeSnapshot ? ` · ${item.vialSizeSnapshot}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">{money(item.unitPriceMinor)}</td>
                  <td className="px-4 py-3 text-end">{item.quantity}</td>
                  <td className="px-4 py-3 text-end">{money(item.lineTotalMinor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="ms-auto flex w-full max-w-xs flex-col gap-1 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(order.subtotalMinor)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery fee</dt><dd>{order.deliveryFeeMinor === 0 ? "Free" : money(order.deliveryFeeMinor)}</dd></div>
          <div className="flex justify-between border-t border-dashed border-border-strong pt-1 text-base font-semibold text-navy"><dt>Total</dt><dd>{money(order.totalMinor)}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="notification" className="flex flex-col gap-2 border-t border-dashed border-border-strong pt-6">
        <h2 id="notification" className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          Store email
        </h2>
        {order.notificationStatus === "sent" && <p className="text-sm">The new-order email was sent.</p>}
        {order.notificationStatus === "pending" && <p className="text-sm text-muted">The email has not been sent yet.</p>}
        {order.notificationStatus === "failed" && (
          <p role="alert" className="text-sm text-danger">
            The new-order email could not be sent ({order.notificationError ?? "unknown error"}). The order itself is saved.
          </p>
        )}
        {order.notificationStatus !== "sent" && (
          <div>
            <ActionButton action={resendOrderEmail.bind(null, order.id)}>Resend email</ActionButton>
          </div>
        )}
      </section>
    </div>
  );
}
