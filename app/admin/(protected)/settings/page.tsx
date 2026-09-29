import { getSettings } from "@/lib/db/queries/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
