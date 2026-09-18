import { getTranslations } from "next-intl/server";
import { FeedbackForm } from "@/components/feedback-form";
import { VialGlyph } from "@/components/vial-glyph";

export async function FeedbackSection() {
  const t = await getTranslations("feedback");

  return (
    <section
      aria-labelledby="feedback-heading"
      className="grid grid-cols-1 gap-8 border-t border-dashed border-border-strong pt-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12"
    >
      <div className="flex flex-col gap-4">
        <VialGlyph className="size-12 text-accent" />
        <h2
          id="feedback-heading"
          className="font-serif text-2xl font-semibold uppercase tracking-wide text-navy sm:text-3xl"
        >
          {t("title")}
        </h2>
        <p className="max-w-sm text-muted">{t("intro")}</p>
      </div>
      <FeedbackForm />
    </section>
  );
}
