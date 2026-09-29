import Link from "next/link";
import { listProductsAdmin } from "@/lib/db/queries/admin";
import { setProductStatus } from "@/app/admin/actions/products";
import { formatMoney } from "@/lib/money";
import { ActionButton } from "@/components/admin/action-button";
import { adminButton, adminGhostButton } from "@/components/admin/admin-form";

export const metadata = { title: "Products" };

const STATUS_LABEL = { draft: "Draft", published: "Published", unpublished: "Unpublished" } as const;

export default async function AdminProductsPage() {
  const rows = await listProductsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Products</h1>
        <Link href="/admin/products/new" className={adminButton}>
          New product
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted">No products yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-strong">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">Product</th>
                <th scope="col" className="px-4 py-3 text-start">Brand</th>
                <th scope="col" className="px-4 py-3 text-start">Price</th>
                <th scope="col" className="px-4 py-3 text-start">Status</th>
                <th scope="col" className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, brandName }) => (
                <tr key={product.id} className="border-t border-border-strong">
                  <td className="px-4 py-3 font-semibold text-navy">
                    {product.nameEn}
                    <span className="block font-mono text-xs font-normal text-muted">{product.slug}</span>
                  </td>
                  <td className="px-4 py-3">{brandName}</td>
                  <td className="px-4 py-3">
                    {product.priceMinor === null ? (
                      <span className="text-muted">No price</span>
                    ) : (
                      formatMoney(product.priceMinor, "en")
                    )}
                  </td>
                  <td className="px-4 py-3">{STATUS_LABEL[product.status]}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/products/${product.id}`} className={adminGhostButton}>
                        Edit
                      </Link>
                      {product.status === "published" ? (
                        <ActionButton action={setProductStatus.bind(null, product.id, "unpublished")}>
                          Unpublish
                        </ActionButton>
                      ) : (
                        <ActionButton action={setProductStatus.bind(null, product.id, "published")}>
                          Publish
                        </ActionButton>
                      )}
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
