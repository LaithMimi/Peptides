import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/db/queries/settings";
import { HeaderNav } from "@/components/header-nav";

/** Logo plate plus the navigation. The logo and name come from store settings. */
export async function SiteHeader() {
  const settings = await getSettings();
  const logo = settings.logoUrl ?? "/brand/pep-club-logo.png";

  return (
    <header className="border-b-4 border-double border-navy bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label={`${settings.storeName}`}>
          <Image
            src={logo}
            alt={settings.storeName}
            width={168}
            height={168}
            priority
            className="brand-mark h-16 w-16 object-contain sm:h-24 sm:w-24"
          />
        </Link>
        <HeaderNav locales={settings.supportedLocales} />
      </div>
    </header>
  );
}
