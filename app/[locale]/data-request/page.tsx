import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataRequestForm } from "@/components/data-request-form";
import { EraseLocalData } from "@/components/erase-local-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dataRequest" });
  return { title: t("title") };
}

export default async function DataRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dataRequest");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header>
        <h1 className="text-balance font-serif text-4xl font-semibold uppercase leading-[1.02] tracking-tight text-navy sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted">{t("intro")}</p>
      </header>
      <DataRequestForm />
      <EraseLocalData />
    </div>
  );
}
