import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CONTACT } from "@/lib/contact";
import { getSettings } from "@/lib/db/queries/settings";
import { pageMetadata } from "@/lib/seo";
import { LtrValue } from "@/components/ltr-value";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ title: t("title"), description: t("intro"), path: "/contact", locale });
}

const labelClass =
  "font-mono text-xs font-semibold uppercase tracking-widest text-muted";
const valueClass = "font-serif text-xl font-semibold text-navy";
const linkFocus =
  "hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const settings = await getSettings();
  const address = settings.address?.trim();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header>
        <h1 className="type-title text-navy">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted">{t("intro")}</p>
      </header>

      <dl className="flex flex-col gap-5 rounded-xl border border-border-strong bg-surface p-5">
        <div>
          <dt className={labelClass}>{t("location")}</dt>
          <dd className={`mt-1 whitespace-pre-line ${valueClass}`}>{address || t("locationValue")}</dd>
        </div>
        <div>
          <dt className={labelClass}>{t("email")}</dt>
          <dd className="mt-1">
            <a href={`mailto:${CONTACT.email}`} className={`${valueClass} ${linkFocus}`}>
              <LtrValue>{CONTACT.email}</LtrValue>
            </a>
          </dd>
        </div>
      </dl>

      <p className="text-sm text-muted">{t("note")}</p>
    </div>
  );
}
