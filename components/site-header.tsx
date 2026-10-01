import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getChromeSettings } from "@/lib/db/queries/chrome";
import { HeaderNav } from "@/components/header-nav";
import { HeaderShell } from "@/components/header-shell";

/** Fixed capsule: logo left, links centered, cart CTA right. Name and logo come from store settings. */
export async function SiteHeader() {
  const settings = await getChromeSettings();
  const logo = settings.logoUrl ?? "/brand/pep-club-logo.png";

  return (
    <HeaderShell>
      <Link
        href="/"
        className="flex items-center gap-2 justify-self-start"
        aria-label={settings.storeName}
      >
        <Image
          src={logo}
          alt=""
          width={96}
          height={96}
          priority
          className="brand-mark h-10 w-10 shrink-0 object-contain @max-[18.5rem]:size-[36px]"
        />
        <span className="hidden text-base font-bold text-navy sm:inline">{settings.storeName}</span>
      </Link>
      <HeaderNav locales={settings.supportedLocales} />
    </HeaderShell>
  );
}
