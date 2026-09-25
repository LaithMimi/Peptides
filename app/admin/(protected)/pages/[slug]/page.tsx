import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pages, PAGE_SLUGS } from "@/lib/db/schema";
import { savePage } from "@/app/admin/actions/pages";
import { AdminField, AdminForm, adminInput } from "@/components/admin/admin-form";

export const metadata = { title: "Edit page" };

export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(PAGE_SLUGS as readonly string[]).includes(slug)) notFound();
  const db = await getDb();
  const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
  if (!page) notFound();
  const publicPath = slug === "about" ? "/en/about" : `/en/legal/${slug}`;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <Link href="/admin/pages" className="text-sm text-navy underline hover:text-accent">
        ← Pages
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">{page.titleEn}</h1>
        <a href={publicPath} target="_blank" rel="noopener noreferrer" className="text-sm text-navy underline hover:text-accent">
          View on the store
        </a>
      </div>

      <AdminForm action={savePage} submitLabel="Save page">
        <input type="hidden" name="slug" value={page.slug} />
        <p className="text-sm text-muted">
          Write in Markdown: <code>## Heading</code>, blank lines between paragraphs, <code>- item</code> for lists.
          HTML is not rendered.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField name="titleEn" label="Title (English)">
            <input id="titleEn" name="titleEn" defaultValue={page.titleEn} required className={adminInput} />
          </AdminField>
          <AdminField name="titleAr" label="Title (Arabic)" help="Optional. English is shown when empty.">
            <input id="titleAr" name="titleAr" dir="rtl" defaultValue={page.titleAr ?? ""} className={adminInput} />
          </AdminField>
        </div>
        <AdminField name="bodyEn" label="Text (English)">
          <textarea id="bodyEn" name="bodyEn" rows={14} defaultValue={page.bodyEn} className={`${adminInput} font-mono text-sm`} />
        </AdminField>
        <AdminField name="bodyAr" label="Text (Arabic)" help="Optional. English is shown when empty.">
          <textarea id="bodyAr" name="bodyAr" dir="rtl" rows={14} defaultValue={page.bodyAr ?? ""} className={`${adminInput} font-mono text-sm`} />
        </AdminField>
        <label className="flex min-h-11 items-start gap-3">
          <input
            type="checkbox"
            name="isPlaceholder"
            defaultChecked={page.isPlaceholder}
            className="mt-1 size-5 rounded border-input-border text-accent"
          />
          <span>
            This is placeholder text
            <span className="block text-sm text-muted">
              Leave checked until the client has approved the wording. Uncheck it once approved.
            </span>
          </span>
        </label>
      </AdminForm>
    </div>
  );
}
