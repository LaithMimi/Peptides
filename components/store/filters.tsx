import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/i18n-fields";
import { inputClass, secondaryButtonClass } from "@/components/form-field";
import type { BrandWithCount, CategoryWithCount } from "@/lib/db/queries/catalog";

export interface ActiveFilters {
  brand?: string;
  area?: string;
  listed?: boolean;
}

/**
 * Brand, research-area and price-listed filters as a plain GET form: works
 * without JavaScript and keeps the state in the URL, so results are shareable.
 * Filters combine (FR-002).
 */
export function Filters({
  brands,
  categories,
  active,
}: {
  brands: BrandWithCount[];
  categories: CategoryWithCount[];
  active: ActiveFilters;
}) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const hasFilters = Boolean(active.brand || active.area || active.listed);

  return (
    <form
      method="get"
      aria-label={t("filtersTitle")}
      className="grid grid-cols-1 gap-3 rounded-xl border border-border-strong bg-surface-raised p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
    >
      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          {t("brandFilter")}
        </span>
        <select name="brand" defaultValue={active.brand ?? ""} className={inputClass}>
          <option value="">{t("allBrands")}</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {pick(b, "name", locale) ?? b.nameEn}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          {t("areaFilter")}
        </span>
        <select name="area" defaultValue={active.area ?? ""} className={inputClass}>
          <option value="">{t("allAreas")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {pick(c, "name", locale) ?? c.nameEn}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          {t("priceFilter")}
        </span>
        <select
          name="price"
          defaultValue={active.listed ? "listed" : ""}
          className={inputClass}
        >
          <option value="">{t("priceAny")}</option>
          <option value="listed">{t("priceListed")}</option>
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-5 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-navy-foreground hover:opacity-90"
        >
          {t("apply")}
        </button>
        {hasFilters && (
          <Link href="/shop" className={secondaryButtonClass}>
            {t("clear")}
          </Link>
        )}
      </div>
    </form>
  );
}
