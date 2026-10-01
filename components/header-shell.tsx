"use client";

import { useEffect, useState } from "react";

/**
 * The fixed capsule. Transparent with no edge while the page is at the top;
 * once the visitor scrolls, `data-scrolled` switches on the glass (blur, rim,
 * shadow — see `.site-nav` in globals.css) so links stay readable over
 * whatever slides underneath.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    // Named so page transitions leave it anchored in place (see globals.css).
    // The header is a size container queried in rem, so the compact layout
    // (`@max-[18.5rem]:` below and in HeaderNav/SiteHeader) follows the
    // visitor's text size as well as the screen width: a phone with large
    // text gets the compact bar instead of pushing the cart and menu
    // off-screen. Gutters cap at 4vw for the same reason.
    <header
      className="@container fixed inset-x-0 top-0 z-50 px-[min(1rem,4vw)] pt-[min(1rem,4vw)] sm:px-6 sm:pt-4 lg:px-8"
      style={{ viewTransitionName: "site-header" }}
    >
      <div
        data-scrolled={scrolled}
        className="site-nav relative mx-auto grid w-full max-w-[1400px] grid-cols-[1fr_auto] items-center gap-x-4 rounded-full px-3 py-2 sm:px-6 md:grid-cols-[1fr_auto_1fr] @max-[18.5rem]:gap-x-[8px] @max-[18.5rem]:px-[8px] @max-[18.5rem]:py-[6px]"
      >
        {children}
      </div>
    </header>
  );
}
