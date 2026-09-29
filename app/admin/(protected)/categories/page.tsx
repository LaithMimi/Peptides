import Link from "next/link";
import { listCategoriesAdmin } from "@/lib/db/queries/admin";
import { setCategoryActive } from "@/app/admin/actions/categories";
import { ActionButton } from "@/components/admin/action-button";
import { adminButton, adminGhostButton } from "@/components/admin/admin-form";

export const metadata = { title: "Research areas" };

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Research areas</h1>
        <Link href="/admin/categories/new" className={adminButton}>
          New research area
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted">No research areas yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-strong">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">Name</th>
                <th scope="col" className="px-4 py-3 text-start">Products</th>
                <th scope="col" className="px-4 py-3 text-start">Status</th>
                <th scope="col" className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border-strong">
                  <td className="px-4 py-3 font-semibold text-navy">
                    {category.nameEn}
                    <span className="block font-mono text-xs font-normal text-muted">{category.slug}</span>
                  </td>
                  <td className="px-4 py-3">{category.productCount}</td>
                  <td className="px-4 py-3">{category.isActive ? "Active" : "Inactive (hidden)"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/categories/${category.id}`} className={adminGhostButton}>
                        Edit
                      </Link>
                      <ActionButton action={setCategoryActive.bind(null, category.id, !category.isActive)}>
                        {category.isActive ? "Deactivate" : "Activate"}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
