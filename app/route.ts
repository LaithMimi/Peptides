import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db/queries/settings";
import { routing } from "@/i18n/routing";

// The bare "/" opens the store in the default language chosen in admin Settings.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { defaultLocale } = await getSettings();
  const locale = (routing.locales as readonly string[]).includes(defaultLocale)
    ? defaultLocale
    : routing.defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
}
