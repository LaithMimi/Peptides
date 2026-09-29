import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// The bare "/" is handled by app/route.ts, which redirects to the default
// language chosen in admin Settings.
// `admin` is excluded: the admin area lives outside the [locale] segment and is
// English-only, so next-intl must not redirect it to /en/admin.
export const config = {
  matcher: ["/((?!api|trpc|admin|_next|_vercel|.*\\..*).+)"],
};
