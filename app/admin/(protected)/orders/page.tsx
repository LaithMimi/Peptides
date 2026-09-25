import Link from "next/link";
import { listOrders } from "@/lib/db/queries/orders";
import { ORDER_STATUSES, STATUS_LABEL, isOrderStatus } from "@/lib/order-status";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Orders" };

type SearchParams = { status?: string; page?: string };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = isOrderStatus(sp.status) ? sp.status : undefined;
  const page = Number(sp.page) || 1;
  const result = await listOrders(status, page);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  const filterLink = (value: string | undefined, label: string) => {
    const active = value === status;
    return (
      <Link
        key={label}
        href={value ? `/admin/orders?status=${value}` : "/admin/orders"}
        aria-current={active ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 font-mono text-xs font-semibold uppercase tracking-wide ${
          active ? "border-navy bg-navy text-navy-foreground" : "border-border-strong text-navy hover:border-navy"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Orders</h1>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {filterLink(undefined, "All")}
        {ORDER_STATUSES.map((s) => filterLink(s, STATUS_LABEL[s]))}
      </nav>

      {result.orders.length === 0 ? (
        <p className="text-muted">No orders{status ? ` with status "${STATUS_LABEL[status]}"` : " yet"}.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-strong">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">Order</th>
                <th scope="col" className="px-4 py-3 text-start">Placed</th>
                <th scope="col" className="px-4 py-3 text-start">Customer</th>
                <th scope="col" className="px-4 py-3 text-start">Total</th>
                <th scope="col" className="px-4 py-3 text-start">Status</th>
                <th scope="col" className="px-4 py-3 text-start">Email</th>
              </tr>
            </thead>
            <tbody>
              {result.orders.map((order) => (
                <tr key={order.id} className="border-t border-border-strong">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-navy underline hover:text-accent">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{formatMoney(order.totalMinor, "en")}</td>
                  <td className="px-4 py-3">{STATUS_LABEL[order.status]}</td>
                  <td className="px-4 py-3">
                    {order.notificationStatus === "failed" ? (
                      <span className="font-semibold text-danger">Not sent</span>
                    ) : (
                      "Sent"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between">
          {result.page > 1 ? (
            <Link className="underline" href={`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), page: String(result.page - 1) })}`}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Page {result.page} of {pages}
          </span>
          {result.page < pages ? (
            <Link className="underline" href={`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), page: String(result.page + 1) })}`}>
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
