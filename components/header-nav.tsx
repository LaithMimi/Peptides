"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { LocaleSwitcher } from "@/components/locale-switcher";

const linkClass =
  "inline-flex min-h-11 items-center rounded px-2 font-serif text-sm font-semibold uppercase tracking-wide text-navy hover:text-accent";

/**
 * Primary navigation. Wide screens show the links inline; on phones they sit
 * behind a menu button (a disclosure, so it works with a keyboard and screen
 * reader). The cart link with its item count and the language switcher stay
 * visible at every width.
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
    <nav aria-label={t("mainNav")} className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-4">
      <div className="hidden flex-wrap items-center gap-x-2 md:flex lg:gap-x-4">{links}</div>

      <Link
        href="/cart"
        className={`${linkClass} relative`}
        aria-label={`${t("cart")} — ${t("cartCount", { count })}`}
      >
        {t("cart")}
        {count > 0 && (
          <span
            aria-hidden="true"
            className="ms-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 font-sans text-xs font-semibold text-accent-foreground"
          >
            {count}
          </span>
        )}
      </Link>

      <Suspense fallback={null}>
        <LocaleSwitcher locales={locales} />
      </Suspense>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-navy px-3 font-mono text-xs font-semibold uppercase tracking-wide text-navy md:hidden"
      >
        {open ? t("closeMenu") : t("menu")}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="flex w-full flex-col items-stretch gap-1 border-t border-dashed border-border-strong pt-2 md:hidden"
        >
          {links}
        </div>
      )}
    </nav>
  );
}
