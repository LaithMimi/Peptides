import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import {
  LAST_UPDATED,
  LEGAL_SLUGS,
  getLegalDoc,
  isLegalSlug,
} from "@/lib/legal-content";
import { Link } from "@/i18n/navigation";
import { EraseLocalData } from "@/components/erase-local-data";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LEGAL_SLUGS.map((doc) => ({ locale, doc }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>;
}): Promise<Metadata> {
  const { locale, doc } = await params;
  if (!isLegalSlug(doc)) return {};
  return { title: getLegalDoc(doc, locale as Locale).title };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>;
}) {
  const { locale, doc } = await params;
  if (!isLegalSlug(doc)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const content = getLegalDoc(doc, locale as Locale);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t("lastUpdated")}: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
        </p>
      </div>

      {content.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="font-serif text-lg font-semibold text-navy">
            {section.heading}
          </h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="leading-relaxed text-foreground">
              {p}
            </p>
          ))}
        </section>
      ))}

      {doc === "cookies" && <EraseLocalData />}
      {doc === "privacy" && (
        <p>
          <Link
            href="/data-request"
            className="font-semibold text-accent underline underline-offset-2"
          >
            {t("footer.dataRequest")}
          </Link>
        </p>
      )}
    </article>
  );
}
