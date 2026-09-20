import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const linkClass = "font-semibold text-accent underline underline-offset-2";

/**
 * Plain-language notice placed beside every form that collects personal data:
 * what it is used for, with links to the terms and privacy policy. It is a
 * notice, not a pre-ticked or bundled consent box.
 */
export function LegalNote({ purpose }: { purpose: "quote" | "feedback" | "otp" }) {
  const t = useTranslations("legal.note");
  return (
    <p className="text-xs text-muted">
      {t(purpose)} {t("prefix")}{" "}
      <Link href="/legal/terms" className={linkClass}>
        {t("terms")}
      </Link>{" "}
      {t("and")}{" "}
      <Link href="/legal/privacy" className={linkClass}>
        {t("privacy")}
      </Link>
      .
    </p>
  );
}
