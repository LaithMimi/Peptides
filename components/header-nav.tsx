"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { LocaleSwitcher } from "@/components/locale-switcher";

const linkClass =
  "inline-flex min-h-11 items-center rounded px-2 text-sm font-medium text-navy transition-colors duration-300 hover:text-accent";

/**
 * Primary navigation, laid out by the capsule grid in `HeaderShell`: links in
 * the centre column on wide screens (behind a menu disclosure on phones, so it
 * works with a keyboard and screen reader), and the glass cart CTA with the
 * language switcher at the end. The cart and switcher stay visible at every
 * width.
 */
export function HeaderNav({ locales }: { locales?: string[] }) {
  const t = useTranslations("nav");
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = (
    <>
      <Link href="/" className={linkClass} onClick={close}>
        {t("home")}
      </Link>
      <Link href="/shop" className={linkClass} onClick={close}>
        {t("shop")}
      </Link>
      <Link href="/start" className={linkClass} onClick={close}>
        {t("researchAreas")}
      </Link>
      <Link href="/brands" className={linkClass} onClick={close}>
        {t("brands")}
      </Link>
      <Link href="/contact" className={linkClass} onClick={close}>
        {t("contact")}
      </Link>
    </>
  );

  return (
    <>
      <nav
        aria-label={t("mainNav")}
        className="hidden items-center justify-center gap-x-1 md:flex lg:gap-x-3"
      >
        {links}
      </nav>

      <div className="flex items-center justify-end gap-x-2 sm:gap-x-3">
        <Suspense fallback={null}>
          <LocaleSwitcher locales={locales} />
        </Suspense>

        <Link
          href="/cart"
          className="glass-button inline-flex min-h-11 items-center px-4 text-sm sm:px-6"
          aria-label={`${t("cart")} — ${t("cartCount", { count })}`}
        >
          {t("cart")}
          {count > 0 && (
            <span
              aria-hidden="true"
              className="ms-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 font-sans text-xs font-semibold text-accent-foreground"
            >
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-accent px-3 font-mono text-xs font-semibold uppercase tracking-wide text-accent transition-colors duration-300 hover:bg-accent hover:text-accent-foreground md:hidden"
        >
          {open ? t("closeMenu") : t("menu")}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label={t("mainNav")}
          className="menu-panel absolute inset-x-0 top-full mt-2 flex flex-col items-stretch gap-1 rounded-2xl p-3 shadow-lg md:hidden"
        >
          {links}
        </nav>
      )}
    </>
  );
}
