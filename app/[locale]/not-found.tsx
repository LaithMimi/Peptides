import { getTranslations } from "next-intl/server";
import { Unavailable } from "@/components/store/unavailable";

// Shown for any notFound() inside the storefront: an unpublished product, an
// inactive brand or research area, or a mistyped address. It never says which.
export default async function NotFound() {
  const t = await getTranslations("product");
  const tu = await getTranslations("unavailable");
  return (
    <Unavailable
      title={t("unavailableTitle")}
      body={t("unavailableBody")}
      actionLabel={tu("browse")}
    />
  );
}
