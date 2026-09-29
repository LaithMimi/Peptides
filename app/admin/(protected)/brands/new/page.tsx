import Link from "next/link";
import { BrandForm } from "@/components/admin/brand-form";

export const metadata = { title: "New brand" };

export default function NewBrandPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/admin/brands" className="text-sm text-navy underline hover:text-accent">
        ← Brands
      </Link>
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">New brand</h1>
      <BrandForm />
    </div>
  );
}
