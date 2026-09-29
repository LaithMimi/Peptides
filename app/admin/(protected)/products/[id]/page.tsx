import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { brands, categories } from "@/lib/db/schema";
import { getProductAdmin } from "@/lib/db/queries/admin";
import { deleteProduct } from "@/app/admin/actions/products";
import { isUuid } from "@/app/admin/actions/shared";
import { ActionButton } from "@/components/admin/action-button";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const detail = await getProductAdmin(id);
  if (!detail) notFound();

  const db = await getDb();
  const [allBrands, allCategories] = await Promise.all([
    db.select().from(brands).orderBy(asc(brands.nameEn)),
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.nameEn)),
  ]);

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link href="/admin/products" className="text-sm text-navy underline hover:text-accent">
          ← Products
        </Link>
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
          {detail.product.nameEn}
        </h1>
      </div>

      <ProductForm
        product={detail.product}
        brands={allBrands}
        categories={allCategories}
        categoryIds={detail.categoryIds}
      />

      <section aria-labelledby="images" className="flex flex-col gap-3">
        <h2 id="images" className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          Images
        </h2>
        <ImageManager
          productId={detail.product.id}
          images={detail.images.map((i) => ({ id: i.id, url: i.url }))}
        />
      </section>

      <section aria-labelledby="danger" className="flex flex-col gap-2 border-t border-dashed border-border-strong pt-6">
        <h2 id="danger" className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          Delete
        </h2>
        <p className="text-sm text-muted">
          A product that has been ordered cannot be deleted; unpublish it instead so past orders stay intact.
        </p>
        <div>
          <ActionButton
            action={deleteProduct.bind(null, detail.product.id)}
            confirm="Delete this product permanently?"
          >
            Delete product
          </ActionButton>
        </div>
      </section>
    </div>
  );
}
