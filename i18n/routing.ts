import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // Language comes from the URL and Accept-Language; no NEXT_LOCALE cookie is
  // set, so the only cookie this site uses is the verified-phone session.
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
