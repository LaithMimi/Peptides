import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/i18n-fields";
import type { CategoryWithCount } from "@/lib/db/queries/catalog";

/** Research-area links shown as pills (same chip language as the locale switcher). */
export function CategoryChips({
  categories,
  currentSlug,
}: {
  categories: Pick<CategoryWithCount, "slug" | "nameEn" | "nameAr">[];
  currentSlug?: string;
}) {
  const locale = useLocale();
  return (
    <ul className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const active = c.slug === currentSlug;
        return (
          <li key={c.slug}>
            <Link
              href={`/categories/${c.slug}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide transition-colors ${
                active
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border-strong bg-surface-raised text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg active:translate-y-0 active:shadow-sm"
              }`}
            >
              {pick(c, "name", locale) ?? c.nameEn}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
