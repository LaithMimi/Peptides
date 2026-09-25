import { saveCategory } from "@/app/admin/actions/categories";
import type { Category } from "@/lib/db/schema";
import { AdminField, AdminForm, adminInput } from "@/components/admin/admin-form";
import { ComplianceHint } from "@/components/admin/compliance-hint";

export function CategoryForm({ category }: { category?: Category }) {
  return (
    <AdminForm action={saveCategory} submitLabel={category ? "Save research area" : "Create research area"}>
      {category && <input type="hidden" name="id" value={category.id} />}
      <ComplianceHint />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="nameEn" label="Name (English)">
          <input id="nameEn" name="nameEn" defaultValue={category?.nameEn} required className={adminInput} />
        </AdminField>
        <AdminField name="nameAr" label="Name (Arabic)" help="Optional. English is shown when empty.">
          <input id="nameAr" name="nameAr" dir="rtl" defaultValue={category?.nameAr ?? ""} className={adminInput} />
        </AdminField>
      </div>
      <AdminField
        name="slug"
        label="Address name (slug)"
        help="Used in the web address, for example /categories/recovery-tissue."
      >
        <input id="slug" name="slug" defaultValue={category?.slug} required className={adminInput} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="descriptionEn" label="Description (English)" help="Shown on the research purpose picker. Up to 500 characters.">
          <textarea id="descriptionEn" name="descriptionEn" rows={3} defaultValue={category?.descriptionEn ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="descriptionAr" label="Description (Arabic)">
          <textarea id="descriptionAr" name="descriptionAr" dir="rtl" rows={3} defaultValue={category?.descriptionAr ?? ""} className={adminInput} />
        </AdminField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="imageUrl" label="Image" help="Optional. An uploaded image URL or a file in /public.">
          <input id="imageUrl" name="imageUrl" defaultValue={category?.imageUrl ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="sortOrder" label="Sort order" help="Lower numbers appear first.">
          <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={category?.sortOrder ?? 0} className={adminInput} />
        </AdminField>
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.isActive ?? true}
          className="size-5 rounded border-input-border text-accent"
        />
        <span>Active</span>
      </label>
    </AdminForm>
  );
}
