import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listProductsByPurposes, listPurposeTiles } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pageMetadata } from "@/lib/seo";
import { BrandGroup } from "@/components/store/brand-group";
import { Pagination } from "@/components/store/pagination";
import { PurposePicker } from "@/components/store/purpose-picker";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "start" });
  return pageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/start",
    locale,
  });
}

/** Chosen purposes from `?purpose=a,b`: unique, trimmed, capped. */
function parsePurposes(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 20);
}

export default async function StartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("start");
  const tShop = await getTranslations("shop");

  const [tiles, settings] = await Promise.all([listPurposeTiles(), getSettings()]);
  // Only areas that are offered can be chosen; anything else in the URL is ignored.
  const offered = new Set(tiles.map((c) => c.slug));
  const selected = parsePurposes(sp.purpose).filter((slug) => offered.has(slug));
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const result = selected.length > 0 ? await listProductsByPurposes(selected, page) : null;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">{t("subtitle")}</p>
      </header>

      <DisclaimerBanner />

      {tiles.length === 0 ? (
        <p className="text-muted">{t("noAreas")}</p>
      ) : (
        <PurposePicker categories={tiles} selected={selected} />
      )}

      <section aria-labelledby="picker-results" className="flex flex-col gap-6">
        <h2 id="picker-results" className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          {t("resultsTitle")}
        </h2>

        {!result ? (
          <p className="text-muted">{t("choosePrompt")}</p>
        ) : (
          <>
            <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
              {tShop("results", { count: result.total })}
            </p>
            {result.groups.length === 0 ? (
              <p className="text-muted">{tShop("empty")}</p>
            ) : (
              result.groups.map((group) => (
                <BrandGroup key={group.brand.slug} group={group} behavior={settings.unpricedBehavior} />
              ))
            )}
            <Pagination
              pathname="/start"
              query={{ purpose: selected.join(",") }}
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
            />
          </>
        )}
      </section>
    </div>
  );
}
