import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { brands, categories } from "@/lib/db/schema";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const db = await getDb();
  const [allBrands, allCategories] = await Promise.all([
    db.select().from(brands).orderBy(asc(brands.nameEn)),
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.nameEn)),
  ]);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <Link href="/admin/products" className="text-sm text-navy underline hover:text-accent">
        ← Products
      </Link>
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">New product</h1>
      <p className="text-sm text-muted">Save the product first, then add images on the next screen.</p>
      <ProductForm brands={allBrands} categories={allCategories} />
    </div>
  );
}
