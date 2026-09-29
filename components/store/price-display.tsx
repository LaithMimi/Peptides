import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";

export type UnpricedBehavior = "ask_price" | "hide_price";

/**
 * Price line for a product. Listed prices are shown as money; unpriced products
 * follow the store setting: "Price unavailable" (ask_price) or nothing at all
 * (hide_price). The caller renders the matching contact button (ProductActions).
 */
export function PriceDisplay({
  priceMinor,
  behavior,
  className,
}: {
  priceMinor: number | null;
  behavior: UnpricedBehavior;
  className?: string;
}) {
  const t = useTranslations("price");
  const locale = useLocale();

  if (priceMinor !== null) {
    return (
      <span className={className}>
        <bdi dir="ltr" className="font-mono font-medium text-navy">
          {formatMoney(priceMinor, locale)}
        </bdi>
      </span>
    );
  }
  if (behavior === "hide_price") return null;
  return <span className={`text-muted ${className ?? ""}`}>{t("unavailable")}</span>;
}
