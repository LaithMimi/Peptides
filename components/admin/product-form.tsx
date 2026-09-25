import { saveProduct } from "@/app/admin/actions/products";
import type { Brand, Category, Product } from "@/lib/db/schema";
import { fromMinor } from "@/lib/money";
import { AdminField, AdminForm, adminInput } from "@/components/admin/admin-form";
import { ComplianceHint } from "@/components/admin/compliance-hint";

export function ProductForm({
  product,
  brands,
  categories,
  categoryIds = [],
}: {
  product?: Product;
  brands: Brand[];
  categories: Category[];
  categoryIds?: string[];
}) {
  return (
    <AdminForm action={saveProduct} submitLabel={product ? "Save product" : "Create product"}>
      {product && <input type="hidden" name="id" value={product.id} />}
      <ComplianceHint />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="brandId" label="Brand">
          <select id="brandId" name="brandId" defaultValue={product?.brandId ?? ""} required className={adminInput}>
            <option value="" disabled>
              Choose a brand
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameEn}
                {b.isActive ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField name="status" label="Status" help="Only published products of active brands appear in the store.">
          <select id="status" name="status" defaultValue={product?.status ?? "draft"} className={adminInput}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="nameEn" label="Name (English)">
          <input id="nameEn" name="nameEn" defaultValue={product?.nameEn} required className={adminInput} />
        </AdminField>
        <AdminField name="nameAr" label="Name (Arabic)" help="Optional. English is shown when empty.">
          <input id="nameAr" name="nameAr" dir="rtl" defaultValue={product?.nameAr ?? ""} className={adminInput} />
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="slug" label="Address name (slug)" help="Unique within the brand, for example tb-500.">
          <input id="slug" name="slug" defaultValue={product?.slug} required className={adminInput} />
        </AdminField>
        <AdminField
          name="price"
          label="Price (₪)"
          help="Leave empty if there is no price yet. Customers cannot order products without a price."
        >
          <input
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={product?.priceMinor != null ? fromMinor(product.priceMinor) : ""}
            className={adminInput}
          />
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="vialSize" label="Vial size" help="For example 10 mg.">
          <input id="vialSize" name="vialSize" dir="ltr" defaultValue={product?.vialSize ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="purityCoa" label="Purity / COA" help="Only enter what a certificate of analysis supports. Leave empty otherwise.">
          <input id="purityCoa" name="purityCoa" dir="ltr" defaultValue={product?.purityCoa ?? ""} className={adminInput} />
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="researchFocusEn" label="Research focus (English)" help="One line on what it is studied for in the laboratory. Up to 300 characters.">
          <textarea id="researchFocusEn" name="researchFocusEn" rows={2} defaultValue={product?.researchFocusEn ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="researchFocusAr" label="Research focus (Arabic)">
          <textarea id="researchFocusAr" name="researchFocusAr" dir="rtl" rows={2} defaultValue={product?.researchFocusAr ?? ""} className={adminInput} />
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="descriptionEn" label="Description (English)">
          <textarea id="descriptionEn" name="descriptionEn" rows={5} defaultValue={product?.descriptionEn ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="descriptionAr" label="Description (Arabic)">
          <textarea id="descriptionAr" name="descriptionAr" dir="rtl" rows={5} defaultValue={product?.descriptionAr ?? ""} className={adminInput} />
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="usageEn" label="Laboratory handling (English)" help="Storage and handling only.">
          <textarea id="usageEn" name="usageEn" rows={3} defaultValue={product?.usageEn ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="usageAr" label="Laboratory handling (Arabic)">
          <textarea id="usageAr" name="usageAr" dir="rtl" rows={3} defaultValue={product?.usageAr ?? ""} className={adminInput} />
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="warningsEn" label="Warnings (English)">
          <textarea id="warningsEn" name="warningsEn" rows={3} defaultValue={product?.warningsEn ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="warningsAr" label="Warnings (Arabic)">
          <textarea id="warningsAr" name="warningsAr" dir="rtl" rows={3} defaultValue={product?.warningsAr ?? ""} className={adminInput} />
        </AdminField>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          Research areas
        </legend>
        {categories.length === 0 ? (
          <p className="text-sm text-muted">No research areas yet. Create one first.</p>
        ) : (
          <div className="grid gap-1 sm:grid-cols-2">
            {categories.map((c) => (
              <label key={c.id} className="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={c.id}
                  defaultChecked={categoryIds.includes(c.id)}
                  className="size-5 rounded border-input-border text-accent"
                />
                <span>
                  {c.nameEn}
                  {c.isActive ? "" : " (inactive)"}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured ?? false}
            className="size-5 rounded border-input-border text-accent"
          />
          <span>Featured on the home page</span>
        </label>
        <AdminField name="sortOrder" label="Sort order" help="Lower numbers appear first within the brand.">
          <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={product?.sortOrder ?? 0} className={adminInput} />
        </AdminField>
      </div>
    </AdminForm>
  );
}
