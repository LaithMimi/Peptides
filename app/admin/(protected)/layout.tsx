import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getChromeSettings } from "@/lib/db/queries/chrome";
import { adminLogout } from "@/app/admin/actions/auth";
import { adminGhostButton } from "@/components/admin/admin-form";
import { AdminNav } from "@/components/admin/admin-nav";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/categories", label: "Research areas" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/settings", label: "Settings" },
];

// Every page in this group requires a signed-in admin. Server Actions check the
// session again themselves: a layout alone does not protect them.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const settings = await getChromeSettings();
  const logo = settings.logoUrl ?? "/brand/pep-club-logo.png";

  return (
    <>
      <header className="border-b border-border-strong bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/admin" className="flex items-center gap-2" aria-label="Admin dashboard">
              <Image src={logo} alt="" width={96} height={96} className="brand-mark h-10 w-10 object-contain" />
              <span className="hidden text-base font-bold text-navy sm:inline">{settings.storeName}</span>
            </Link>
            <AdminNav items={NAV} />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{admin.email}</span>
            <form action={adminLogout}>
              <button type="submit" className={adminGhostButton}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
