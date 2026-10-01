"use client";

import { Suspense, ViewTransition, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { CART_ADDED_EVENT, useCart } from "@/lib/cart-store";
import { LocaleSwitcher } from "@/components/locale-switcher";

const linkClass =
  "nav-link inline-flex min-h-11 items-center rounded px-2 text-sm font-medium text-navy transition-colors duration-300 hover:text-accent aria-[current=page]:text-accent";

/** Which top-level section a pathname belongs to, for the active-link underline. */
function sectionOf(pathname: string): string | null {
  if (pathname === "/") return "/";
  if (pathname.startsWith("/shop") || pathname.startsWith("/products")) return "/shop";
  if (pathname.startsWith("/start") || pathname.startsWith("/categories")) return "/start";
  if (pathname.startsWith("/brands")) return "/brands";
  if (pathname.startsWith("/contact")) return "/contact";
  return null;
}

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
  const active = sectionOf(usePathname());
  const cartRef = useRef<HTMLAnchorElement>(null);

  // Acknowledge an add-to-cart where the cart lives: the CTA nudges and its
  // count pops. Driven by an explicit event (not by watching the count) so
  // loading a page with a saved cart, or editing quantities on the cart page,
  // never triggers it.
  useEffect(() => {
    const onAdded = () => {
      const cart = cartRef.current;
      if (!cart || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
      cart.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
        { duration: 420, easing: ease }
      );
      cart.querySelector(".cart-badge")?.animate(
        [
          { transform: "scale(0.4)", opacity: 0 },
          { transform: "scale(1.25)", opacity: 1, offset: 0.55 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 460, easing: ease }
      );
    };
    window.addEventListener(CART_ADDED_EVENT, onAdded);
    return () => window.removeEventListener(CART_ADDED_EVENT, onAdded);
  }, []);

  const links = (indicator: boolean) =>
    (
      [
        ["/", t("home")],
        ["/shop", t("shop")],
        ["/start", t("researchAreas")],
        ["/brands", t("brands")],
        ["/contact", t("contact")],
      ] as const
    ).map(([href, label]) => (
      <Link
        key={href}
        href={href}
        className={linkClass}
        onClick={close}
        aria-current={active === href ? "page" : undefined}
      >
        {label}
        {/* One underline, named for View Transitions, so it slides from the
            old section's link to the new one on navigation. Desktop only:
            the mobile menu would render a second element with the same name. */}
        {indicator && active === href && (
          <ViewTransition
            name="nav-indicator"
            share="nav-indicator"
            enter="nav-indicator-in"
            exit="nav-indicator-out"
            default="none"
          >
            <span aria-hidden="true" className="nav-indicator" />
          </ViewTransition>
        )}
      </Link>
    ));

  return (
    <>
      <nav
        aria-label={t("mainNav")}
        className="hidden items-center justify-center gap-x-1 md:flex lg:gap-x-3"
      >
        {links(true)}
      </nav>

      <div className="flex items-center justify-end gap-x-2 sm:gap-x-3">
        <Suspense fallback={null}>
          <LocaleSwitcher locales={locales} />
        </Suspense>

        <Link
          ref={cartRef}
          href="/cart"
          className="btn-glass inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold sm:px-6"
          aria-label={`${t("cart")} — ${t("cartCount", { count })}`}
        >
          {t("cart")}
          {count > 0 && (
            <span
              aria-hidden="true"
              className="cart-badge ms-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 font-sans text-xs font-semibold text-accent-foreground"
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
          className="inline-flex min-h-11 min-w-11 items-center justify-center btn-glass rounded-full px-3 font-mono text-xs font-semibold uppercase tracking-wide md:hidden"
        >
          {open ? t("closeMenu") : t("menu")}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label={t("mainNav")}
          className="menu-panel menu-in absolute inset-x-0 top-full mt-2 flex flex-col items-stretch gap-1 rounded-2xl p-3 shadow-lg md:hidden"
        >
          {links(false)}
        </nav>
      )}
    </>
  );
}
