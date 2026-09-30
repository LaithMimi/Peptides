import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/db/queries/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

const linkClass =
  "inline-flex min-h-11 items-center rounded px-1 text-sm font-medium text-navy transition-colors duration-300 hover:text-accent";

/** A plain surface capsule at the header's 1400px width: bold logo, 14px medium links. */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tl = await getTranslations("legal.footer");
  const site = await getTranslations("site");
  const tp = await getTranslations("price");
  const settings = await getSettings();
  const whatsapp = whatsappLink(settings.whatsappNumber);
  const logo = settings.logoUrl ?? "/brand/pep-club-logo.png";

  return (
    <footer className="px-4 pb-4 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 rounded-[2rem] border border-border bg-surface px-5 py-8 text-sm text-navy shadow-sm sm:px-10">
        <Link href="/" className="flex w-fit items-center gap-2" aria-label={settings.storeName}>
          <Image
            src={logo}
            alt=""
            width={96}
            height={96}
            className="brand-mark h-10 w-10 object-contain"
          />
          <span className="text-base font-bold text-navy">{settings.storeName}</span>
        </Link>

        <p className="max-w-3xl text-muted">{t("disclaimer")}</p>

        <nav aria-label={tl("navLabel")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href="/legal/privacy" className={linkClass}>
                {tl("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className={linkClass}>
                {tl("terms")}
              </Link>
            </li>
            <li>
              <Link href="/legal/shipping-returns" className={linkClass}>
                {tl("shippingReturns")}
              </Link>
            </li>
            <li>
              <Link href="/legal/product-disclaimer" className={linkClass}>
                {tl("productDisclaimer")}
              </Link>
            </li>
            <li>
              <Link href="/about" className={linkClass}>
                {tl("about")}
              </Link>
            </li>
            <li>
              <Link href="/legal/cookies" className={linkClass}>
                {tl("cookies")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className={linkClass}>
                {tl("contact")}
              </Link>
            </li>
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {tp("whatsappLabel")}
                </a>
              </li>
            )}
            <li>
              <Link href="/data-request" className={linkClass}>
                {tl("dataRequest")}
              </Link>
            </li>
            <li>
              <CookieSettingsButton className={linkClass} />
            </li>
          </ul>
        </nav>

        <p className="text-muted">
          &copy; {new Date().getFullYear()} {site("name")} — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
