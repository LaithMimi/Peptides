import { saveSettings } from "@/app/admin/actions/settings";
import type { StoreSettings } from "@/lib/db/schema";
import { fromMinor } from "@/lib/money";
import { AdminField, AdminForm, adminInput } from "@/components/admin/admin-form";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  return (
    <AdminForm action={saveSettings} submitLabel="Save settings">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          Store information
        </legend>
        <AdminField name="storeName" label="Store name">
          <input id="storeName" name="storeName" defaultValue={settings.storeName} required className={adminInput} />
        </AdminField>
        <AdminField name="logoUrl" label="Logo" help="An uploaded image URL or a file in /public, for example /brand/pep-club-logo.png.">
          <input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl ?? ""} className={adminInput} />
        </AdminField>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField name="phone" label="Phone" help="Shown on the Contact page.">
            <input id="phone" name="phone" type="tel" dir="ltr" defaultValue={settings.phone ?? ""} className={adminInput} />
          </AdminField>
          <AdminField
            name="whatsappNumber"
            label="WhatsApp number"
            help="Digits with the country code, for example 972501234567. Leave empty to hide all WhatsApp buttons."
          >
            <input id="whatsappNumber" name="whatsappNumber" dir="ltr" defaultValue={settings.whatsappNumber ?? ""} className={adminInput} />
          </AdminField>
        </div>
        <AdminField name="email" label="Store email" help="New-order emails are sent here.">
          <input id="email" name="email" type="email" dir="ltr" defaultValue={settings.email ?? ""} className={adminInput} />
        </AdminField>
        <AdminField name="address" label="Address">
          <textarea id="address" name="address" rows={2} defaultValue={settings.address ?? ""} className={adminInput} />
        </AdminField>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          Delivery
        </legend>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="deliveryEnabled"
            defaultChecked={settings.deliveryEnabled}
            className="size-5 rounded border-input-border text-accent"
          />
          <span>Delivery enabled</span>
        </label>
        <AdminField
          name="deliveryFee"
          label="Delivery fee (₪)"
          help="Leave empty or 0 for free delivery. Applied to every order at checkout; past orders keep their own fee."
        >
          <input
            id="deliveryFee"
            name="deliveryFee"
            inputMode="decimal"
            defaultValue={settings.deliveryFeeMinor > 0 ? fromMinor(settings.deliveryFeeMinor) : ""}
            className={adminInput}
          />
        </AdminField>
        <AdminField name="maxLineQuantity" label="Maximum quantity per item" help="How many of one product a customer can order at once.">
          <input id="maxLineQuantity" name="maxLineQuantity" type="number" min={1} max={100} defaultValue={settings.maxLineQuantity} className={adminInput} />
        </AdminField>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          Product pricing
        </legend>
        <AdminField
          name="unpricedBehavior"
          label="Unpriced products"
          help="What customers see for a product without a price. Either way they cannot order it, and the button opens WhatsApp with the product name."
        >
          <select id="unpricedBehavior" name="unpricedBehavior" defaultValue={settings.unpricedBehavior} className={adminInput}>
            <option value="ask_price">Show &ldquo;Price unavailable&rdquo; and an &ldquo;Ask about price&rdquo; button</option>
            <option value="hide_price">Hide the price and show a contact button</option>
          </select>
        </AdminField>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          Languages
        </legend>
        <AdminField name="defaultLocale" label="Default language" help="The language the store opens in when a visitor arrives at the bare web address.">
          <select id="defaultLocale" name="defaultLocale" defaultValue={settings.defaultLocale} className={adminInput}>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </AdminField>
        <fieldset className="flex flex-col gap-1">
          <legend className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
            Supported languages
          </legend>
          {(["en", "ar"] as const).map((code) => (
            <label key={code} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                name="supportedLocales"
                value={code}
                defaultChecked={settings.supportedLocales.includes(code)}
                className="size-5 rounded border-input-border text-accent"
              />
              <span>{code === "en" ? "English" : "Arabic"}</span>
            </label>
          ))}
          <SupportedError />
        </fieldset>
      </fieldset>
    </AdminForm>
  );
}

function SupportedError() {
  return (
    <p className="text-xs text-muted">
      The language switcher lists only the supported languages. At least one is required, and it must include the default.
    </p>
  );
}
