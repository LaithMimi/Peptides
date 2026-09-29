import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/i18n-fields";
import type { CategoryWithCount } from "@/lib/db/queries/catalog";
import { secondaryButtonClass } from "@/components/form-field";

/**
 * Research-purpose picker. Each research area is a tile; selecting toggles it
 * in the `?purpose=a,b` query, so the choice is shareable, works without
 * JavaScript, and survives a language switch. Wording is research/laboratory
 * framing only (Constitution I): area names and descriptions come from the
 * database, written and approved by the client.
 */
export function PurposePicker({
  categories,
  selected,
}: {
  categories: CategoryWithCount[];
  selected: string[];
}) {
  const t = useTranslations("start");
  const th = useTranslations("home");
  const locale = useLocale();

  const hrefFor = (slugs: string[]) => ({
    pathname: "/start",
    query: slugs.length > 0 ? { purpose: slugs.join(",") } : {},
  });

  return (
    <section aria-labelledby="picker-title" className="flex flex-col gap-4">
      <h2 id="picker-title" className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
        {t("pickerTitle")}
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const isSelected = selected.includes(category.slug);
          const next = isSelected
            ? selected.filter((s) => s !== category.slug)
            : [...selected, category.slug];
          const name = pick(category, "name", locale) ?? category.nameEn;
          const description = pick(category, "description", locale);

          return (
            <li key={category.slug}>
              <Link
                href={hrefFor(next)}
                scroll={false}
                aria-current={isSelected ? "true" : undefined}
                aria-label={isSelected ? t("deselect", { name }) : t("select", { name })}
                className={`flex h-full min-h-28 flex-col gap-2 rounded-xl border-2 p-4 transition-colors ${
                  isSelected
                    ? "border-navy bg-surface-raised"
                    : "border-border-strong bg-surface hover:border-navy"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-serif text-base font-semibold uppercase tracking-wide text-navy">
                    {name}
                  </span>
                  {isSelected && (
                    <span className="shrink-0 rounded-full bg-navy px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-navy-foreground">
                      {t("selected")}
                    </span>
                  )}
                </span>
                {description && <span className="line-clamp-4 text-sm text-muted">{description}</span>}
                <span className="mt-auto font-mono text-xs uppercase tracking-widest text-muted">
                  {th("productCount", { count: category.productCount })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {selected.length > 0 && (
        <Link href={hrefFor([])} scroll={false} className={secondaryButtonClass}>
          {t("clear")}
        </Link>
      )}
    </section>
  );
}
