import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/db/queries/settings";
import { HeaderNav } from "@/components/header-nav";

/** Logo plate plus the navigation. The logo and name come from store settings. */
export async function SiteHeader() {
  const settings = await getSettings();
  const logo = settings.logoUrl ?? "/brand/pep-club-logo.png";

  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="nav-gradient relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-full px-4 py-2 shadow-lg sm:px-6">
        <Link href="/" className="flex items-center" aria-label={`${settings.storeName}`}>
          <Image
            src={logo}
            alt={settings.storeName}
            width={168}
            height={168}
            priority
            className="brand-mark-on-gradient h-12 w-12 object-contain sm:h-16 sm:w-16"
          />
        </Link>
        <HeaderNav locales={settings.supportedLocales} />
      </div>
    </header>
  );
}
