import { getTranslations } from "next-intl/server";
import { Unavailable } from "@/components/store/unavailable";

// Shown for any notFound() inside the storefront: an unpublished product, an
// inactive brand or research area, or a mistyped address. The copy covers all
// of them without saying which.
export default async function NotFound() {
  const t = await getTranslations("unavailable");
  return <Unavailable title={t("title")} body={t("body")} actionLabel={t("browse")} />;
}
