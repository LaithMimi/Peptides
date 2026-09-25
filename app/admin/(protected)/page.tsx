import Link from "next/link";
import { dashboardCounts } from "@/lib/db/queries/admin";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const counts = await dashboardCounts();
  const cards = [
    { label: "New orders", value: counts.newOrders, href: "/admin/orders?status=new" },
    { label: "Orders to process", value: counts.processingOrders, href: "/admin/orders?status=processing" },
    { label: "Products", value: counts.products, href: "/admin/products" },
    { label: "Brands", value: counts.brands, href: "/admin/brands" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Dashboard</h1>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className="flex h-full flex-col gap-1 rounded-xl border border-border-strong bg-surface p-5 hover:border-navy"
            >
              <span className="text-3xl font-semibold text-navy">{card.value}</span>
              <span className="font-mono text-xs uppercase tracking-widest text-muted">{card.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
