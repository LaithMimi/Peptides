import { saveBrand } from "@/app/admin/actions/brands";
import type { Brand } from "@/lib/db/schema";
import { AdminField, AdminForm, adminInput } from "@/components/admin/admin-form";

export function BrandForm({ brand }: { brand?: Brand }) {
  return (
    <AdminForm action={saveBrand} submitLabel={brand ? "Save brand" : "Create brand"}>
      {brand && <input type="hidden" name="id" value={brand.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="nameEn" label="Name (English)">
          <input id="nameEn" name="nameEn" defaultValue={brand?.nameEn} required className={adminInput} />
        </AdminField>
        <AdminField name="nameAr" label="Name (Arabic)" help="Optional. English is shown when empty.">
          <input id="nameAr" name="nameAr" dir="rtl" defaultValue={brand?.nameAr ?? ""} className={adminInput} />
        </AdminField>
      </div>
      <AdminField
        name="slug"
        label="Address name (slug)"
        help="Used in the web address, for example /brands/pep-lab. Lowercase letters, numbers and hyphens."
      >
        <input id="slug" name="slug" defaultValue={brand?.slug} required className={adminInput} />
      </AdminField>
      <AdminField
        name="logoUrl"
        label="Logo"
        help="An uploaded image URL or a file in /public, for example /brand/logo.png. Optional."
      >
        <input id="logoUrl" name="logoUrl" defaultValue={brand?.logoUrl ?? ""} className={adminInput} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField name="descriptionEn" label="Description (English)">
          <textarea id="descriptionEn" name="descriptionEn" rows={4} defaultValue={brand?.descriptionEn ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="descriptionAr" label="Description (Arabic)">
          <textarea id="descriptionAr" name="descriptionAr" dir="rtl" rows={4} defaultValue={brand?.descriptionAr ?? ""} className={adminInput} />
        </AdminField>
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={brand?.isActive ?? true}
          className="size-5 rounded border-input-border text-accent"
        />
        <span>
          Active <span className="text-sm text-muted">(inactive brands and their products are hidden from the store)</span>
        </span>
      </label>
    </AdminForm>
  );
}
