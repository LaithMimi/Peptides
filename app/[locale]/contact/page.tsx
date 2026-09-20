import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CONTACT } from "@/lib/contact";
import { LtrValue } from "@/components/ltr-value";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

const labelClass =
  "font-mono text-xs font-semibold uppercase tracking-widest text-muted";
const valueClass = "font-serif text-xl font-semibold text-navy";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div>
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted">{t("intro")}</p>
      </div>

      <dl className="flex flex-col gap-5 rounded-xl border border-border-strong bg-surface p-5">
        <div>
          <dt className={labelClass}>{t("location")}</dt>
          <dd className={`mt-1 ${valueClass}`}>{t("locationValue")}</dd>
        </div>
        <div>
          <dt className={labelClass}>{t("phone")}</dt>
          <dd className="mt-1">
            <a
              href={`tel:${CONTACT.phone}`}
              aria-label={`${t("call")} ${CONTACT.phoneDisplay}`}
              className={`${valueClass} hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
            >
              <LtrValue>{CONTACT.phoneDisplay}</LtrValue>
            </a>
          </dd>
        </div>
        {CONTACT.email && (
          <div>
            <dt className={labelClass}>{t("email")}</dt>
            <dd className="mt-1">
              <a
                href={`mailto:${CONTACT.email}`}
                className={`${valueClass} hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
              >
                <LtrValue>{CONTACT.email}</LtrValue>
              </a>
            </dd>
          </div>
        )}
      </dl>

      <p className="text-sm text-muted">{t("note")}</p>
    </div>
  );
}
