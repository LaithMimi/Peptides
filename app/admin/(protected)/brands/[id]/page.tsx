import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrandAdmin } from "@/lib/db/queries/admin";
import { isUuid } from "@/app/admin/actions/shared";
import { BrandForm } from "@/components/admin/brand-form";

export const metadata = { title: "Edit brand" };

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const brand = await getBrandAdmin(id);
  if (!brand) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/admin/brands" className="text-sm text-navy underline hover:text-accent">
        ← Brands
      </Link>
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">{brand.nameEn}</h1>
      <BrandForm brand={brand} />
    </div>
  );
}
