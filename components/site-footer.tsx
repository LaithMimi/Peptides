import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/db/queries/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

const linkClass =
  "underline underline-offset-2 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tl = await getTranslations("legal.footer");
  const site = await getTranslations("site");
  const tp = await getTranslations("price");
  const settings = await getSettings();
  const whatsapp = whatsappLink(settings.whatsappNumber);

  return (
    <footer className="border-t border-border-strong bg-navy text-navy-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm sm:px-6 lg:px-8">
        <p className="opacity-90">{t("disclaimer")}</p>

        <nav aria-label={tl("navLabel")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 opacity-90">
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

        <p className="opacity-90">
          &copy; {new Date().getFullYear()} {site("name")} — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
