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
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so any navigation (a link,
  // the back button) closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const close = () => setOpenedOn(null);
  const active = sectionOf(pathname);
  const cartRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // A disclosure dismisses like the language menu: Escape closes it and puts
  // focus back on the toggle; a press anywhere outside closes it too.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenedOn(null);
      menuButtonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setOpenedOn(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

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

      {/* Compact bar (`@max-[18.5rem]:`, see HeaderShell): the globe moves into
          the menu panel, the menu label becomes an icon, and padding stops
          scaling with the text, so the cart and menu always stay on-screen. */}
      <div className="flex items-center justify-end gap-x-2 sm:gap-x-3 @max-[18.5rem]:gap-x-[6px]">
        <div className="@max-[18.5rem]:hidden">
          <Suspense fallback={null}>
            <LocaleSwitcher locales={locales} />
          </Suspense>
        </div>

        <Link
          ref={cartRef}
          href="/cart"
          className="btn-glass inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold sm:px-6 @max-[18.5rem]:min-h-[44px] @max-[18.5rem]:px-[12px]"
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
          ref={menuButtonRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpenedOn(open ? null : pathname)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center btn-glass rounded-full px-3 font-mono text-xs font-semibold uppercase tracking-wide md:hidden @max-[18.5rem]:size-[44px] @max-[18.5rem]:min-h-0 @max-[18.5rem]:min-w-0 @max-[18.5rem]:px-0"
        >
          <span className="@max-[18.5rem]:sr-only">{open ? t("closeMenu") : t("menu")}</span>
          <MenuIcon open={open} className="hidden size-[22px] @max-[18.5rem]:block" />
        </button>
      </div>

      {open && (
        <nav
          ref={panelRef}
          id="mobile-menu"
          aria-label={t("mainNav")}
          className="menu-panel menu-in absolute inset-x-0 top-full mt-2 flex flex-col items-stretch gap-1 rounded-2xl p-3 shadow-lg md:hidden"
        >
          {links(false)}
          <div className="mt-1 hidden border-t border-border pt-3 @max-[18.5rem]:block">
            <Suspense fallback={null}>
              <LocaleSwitcher locales={locales} variant="inline" />
            </Suspense>
          </div>
        </nav>
      )}
    </>
  );
}

/** Three bars that cross into a close mark; drawn at a fixed size for the compact bar. */
function MenuIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}
