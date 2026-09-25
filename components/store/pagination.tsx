import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { secondaryButtonClass } from "@/components/form-field";

/** Previous/next links that keep the current query string. */
export function Pagination({
  pathname,
  query,
  page,
  pageSize,
  total,
}: {
  pathname: string;
  query: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const t = useTranslations("shop");
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const hrefFor = (target: number) => ({
    pathname,
    query: {
      ...Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== "")
      ),
      ...(target > 1 ? { page: String(target) } : {}),
    } as Record<string, string>,
  });

  return (
    <nav
      aria-label={t("paginationLabel")}
      className="flex items-center justify-between gap-3 border-t border-dashed border-border-strong pt-4"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={secondaryButtonClass}>
          {t("previous")}
        </Link>
      ) : (
        <span />
      )}
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {t("pageOf", { page, pages })}
      </span>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={secondaryButtonClass}>
          {t("next")}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
