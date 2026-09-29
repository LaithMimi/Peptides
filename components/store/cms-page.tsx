import { notFound } from "next/navigation";
import { getPage } from "@/lib/db/queries/pages";
import { pick } from "@/lib/i18n-fields";
import { Markdown } from "@/components/store/markdown";

/** An admin-editable page (About, Terms, Privacy, Shipping & Returns, Disclaimer, Cookies). */
export async function CmsPage({
  slug,
  locale,
  children,
}: {
  slug: string;
  locale: string;
  children?: React.ReactNode;
}) {
  const page = await getPage(slug);
  if (!page) notFound();
  const title = pick(page, "title", locale) ?? page.titleEn;
  const body = pick(page, "body", locale) ?? "";

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
        {title}
      </h1>
      <Markdown>{body}</Markdown>
      {children}
    </article>
  );
}
