import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AddToCart } from "@/components/store/add-to-cart";
import type { UnpricedBehavior } from "@/components/store/price-display";
import { WhatsAppButton } from "@/components/store/whatsapp-button";

/**
 * The purchase area of a product page. A priced product gets quantity + Add to
 * Cart. An unpriced product cannot be ordered: it gets a WhatsApp button that
 * opens a chat prefilled with the product name. The wording follows the store
 * setting ("ask about price" vs. a plain contact button) and is not hardcoded.
 * Without a WhatsApp number the button is not rendered (a link to the contact
 * page is shown instead).
 */
export function ProductActions({
  product,
  behavior,
  whatsappNumber,
  maxQuantity,
}: {
  product: { id: string; name: string; priceMinor: number | null };
  behavior: UnpricedBehavior;
  whatsappNumber: string | null;
  maxQuantity: number;
}) {
  const t = useTranslations("price");

  if (product.priceMinor !== null) {
    return <AddToCart productId={product.id} productName={product.name} maxQuantity={maxQuantity} />;
  }

  const label = behavior === "ask_price" ? t("askAbout") : t("contactStore");
  const message = t("whatsappInquiry", { product: product.name });

  return (
    <div className="flex flex-col gap-2">
      <WhatsAppButton number={whatsappNumber} message={message} label={label} />
      {!whatsappNumber && (
        <Link
          href="/contact"
          className="inline-flex min-h-11 w-fit items-center font-serif text-sm font-semibold uppercase tracking-wide text-navy underline hover:text-accent"
        >
          {t("contactStore")}
        </Link>
      )}
    </div>
  );
}
