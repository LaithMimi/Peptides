import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "New research area" };

export default function NewCategoryPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/admin/categories" className="text-sm text-navy underline hover:text-accent">
        ← Research areas
      </Link>
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
        New research area
      </h1>
      <CategoryForm />
    </div>
  );
}
