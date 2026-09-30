"use client";

import { useEffect } from "react";

/**
 * Flags <html data-scrolled> once the page leaves the top, so the homepage nav
 * can go from transparent to blurred glass (see `.nav-glass` in globals.css).
 * Renders nothing; also the `.home-scope` marker that scopes the dark theme.
 */
export function HomeScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      if (window.scrollY > 24) root.setAttribute("data-scrolled", "");
      else root.removeAttribute("data-scrolled");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      root.removeAttribute("data-scrolled");
    };
  }, []);

  return <span className="home-scope hidden" aria-hidden="true" />;
}
