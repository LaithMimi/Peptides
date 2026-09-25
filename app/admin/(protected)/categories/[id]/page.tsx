import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryAdmin } from "@/lib/db/queries/admin";
import { isUuid } from "@/app/admin/actions/shared";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Edit research area" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const category = await getCategoryAdmin(id);
  if (!category) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/admin/categories" className="text-sm text-navy underline hover:text-accent">
        ← Research areas
      </Link>
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
        {category.nameEn}
      </h1>
      <CategoryForm category={category} />
    </div>
  );
}
