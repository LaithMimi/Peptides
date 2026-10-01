"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-x-1 gap-y-1">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-3 font-serif text-xs font-semibold uppercase tracking-wide transition-colors ${
              active ? "bg-surface-raised text-accent" : "text-navy hover:bg-surface-raised hover:text-accent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
