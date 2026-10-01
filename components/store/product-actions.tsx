import { useTranslations } from "next-intl";
import { AddToCart } from "@/components/store/add-to-cart";
import type { UnpricedBehavior } from "@/components/store/price-display";
import { CONTACT } from "@/lib/contact";

/**
 * The purchase area of a product page. A priced product gets quantity + Add to
 * Cart. An unpriced product cannot be ordered: it gets an email link that opens
 * a message to the store prefilled with the product name. The wording follows
 * the store setting ("ask about price" vs. a plain contact button) and is not
 * hardcoded.
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
  const subject = t("emailSubject", { product: product.name });
  const body = t("emailInquiry", { product: product.name });
  const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <a
      href={href}
      className="btn-primary inline-flex min-h-11 w-fit items-center justify-center rounded-full px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide transition-colors"
    >
      {label}
    </a>
  );
}
