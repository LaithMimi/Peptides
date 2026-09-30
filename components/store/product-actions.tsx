import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AddToCart } from "@/components/store/add-to-cart";
import type { UnpricedBehavior } from "@/components/store/price-display";

/**
 * The purchase area of a product page. A priced product gets quantity + Add to
 * Cart. An unpriced product cannot be ordered: it gets a link to the Contact
 * page instead. The wording follows the store setting ("ask about price" vs.
 * a plain contact link) and is not hardcoded.
 */
export function ProductActions({
  product,
  behavior,
  maxQuantity,
}: {
  product: { id: string; name: string; priceMinor: number | null };
  behavior: UnpricedBehavior;
  maxQuantity: number;
}) {
  const t = useTranslations("price");

  if (product.priceMinor !== null) {
    return <AddToCart productId={product.id} productName={product.name} maxQuantity={maxQuantity} />;
  }

  const label = behavior === "ask_price" ? t("askAbout") : t("contactStore");

  return (
    <Link
      href="/contact"
      className="inline-flex min-h-11 w-fit items-center font-serif text-sm font-semibold uppercase tracking-wide text-navy underline hover:text-accent"
    >
      {label}
    </Link>
  );
}
