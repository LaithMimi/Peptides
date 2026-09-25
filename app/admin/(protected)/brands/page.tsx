import Link from "next/link";
import { listBrandsAdmin } from "@/lib/db/queries/admin";
import { setBrandActive } from "@/app/admin/actions/brands";
import { ActionButton } from "@/components/admin/action-button";
import { adminButton, adminGhostButton } from "@/components/admin/admin-form";

export const metadata = { title: "Brands" };

export default async function AdminBrandsPage() {
  const brands = await listBrandsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Brands</h1>
        <Link href="/admin/brands/new" className={adminButton}>
          New brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <p className="text-muted">No brands yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-strong">
          <table className="w-full min-w-[32rem] text-start text-sm">
            <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">Name</th>
                <th scope="col" className="px-4 py-3 text-start">Products</th>
                <th scope="col" className="px-4 py-3 text-start">Status</th>
                <th scope="col" className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-t border-border-strong">
                  <td className="px-4 py-3 font-semibold text-navy">
                    {brand.nameEn}
                    <span className="block font-mono text-xs font-normal text-muted">{brand.slug}</span>
                  </td>
                  <td className="px-4 py-3">{brand.productCount}</td>
                  <td className="px-4 py-3">{brand.isActive ? "Active" : "Inactive (hidden)"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/brands/${brand.id}`} className={adminGhostButton}>
                        Edit
                      </Link>
                      <ActionButton action={setBrandActive.bind(null, brand.id, !brand.isActive)}>
                        {brand.isActive ? "Deactivate" : "Activate"}
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
