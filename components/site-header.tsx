"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function SiteHeader() {
  const tSite = useTranslations("site");
  const tNav = useTranslations("nav");
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-foreground">
          {tSite("name")}
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            {tNav("catalog")}
          </Link>
          <Link
            href="/quote"
            className="relative text-sm font-medium text-foreground hover:text-primary"
          >
            {tNav("quote")}
            {count > 0 && (
              <span className="ms-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
