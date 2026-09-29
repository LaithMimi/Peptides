import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pages } from "@/lib/db/schema";
import { adminGhostButton } from "@/components/admin/admin-form";

export const metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const db = await getDb();
  const rows = await db.select().from(pages).orderBy(asc(pages.titleEn));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Pages</h1>
      <p className="max-w-2xl text-sm text-muted">
        The About page and the legal pages. Text written here is shown on the store in the matching
        language. Legal text must be supplied or approved by the client.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border-strong">
        <table className="w-full min-w-[30rem] text-sm">
          <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-start">Page</th>
              <th scope="col" className="px-4 py-3 text-start">Text status</th>
              <th scope="col" className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((page) => (
              <tr key={page.id} className="border-t border-border-strong">
                <td className="px-4 py-3 font-semibold text-navy">
                  {page.titleEn}
                  <span className="block font-mono text-xs font-normal text-muted">{page.slug}</span>
                </td>
                <td className="px-4 py-3">
                  {page.isPlaceholder ? (
                    <span className="font-semibold text-navy">Placeholder: awaiting client approval</span>
                  ) : (
                    "Approved"
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${page.slug}`} className={adminGhostButton}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
