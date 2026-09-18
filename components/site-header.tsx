"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function SiteHeader() {
  const tNav = useTranslations("nav");
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="border-b-4 border-double border-navy bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Pep Club — home">
          <Image
            src="/brand/pep-club-logo.jpeg"
            alt="Pep Club — Premium Peptides"
            width={168}
            height={168}
            priority
            className="brand-mark h-20 w-20 object-contain sm:h-28 sm:w-28"
          />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="rounded px-2 py-1 font-serif text-sm font-semibold uppercase tracking-wide text-navy hover:text-accent"
          >
            {tNav("catalog")}
          </Link>
          <Link
            href="/quote"
            className="relative rounded px-2 py-1 font-serif text-sm font-semibold uppercase tracking-wide text-navy hover:text-accent"
          >
            {tNav("quote")}
            {count > 0 && (
              <span className="ms-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 font-sans text-xs font-semibold text-accent-foreground">
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
