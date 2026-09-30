import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LtrValue } from "@/components/ltr-value";

/** Step illustrations live in public/howToUse (transparent PNGs). */
const STEPS = [1, 2, 3, 4, 5, 6] as const;

export async function HowToUse() {
  const t = await getTranslations("howToUse");

  return (
    <section aria-labelledby="home-how-to-use" className="flex flex-col gap-4">
      <div>
        <h2
          id="home-how-to-use"
          className="font-serif text-xl font-semibold uppercase tracking-wide text-navy"
        >
          {t("title")}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{t("intro")}</p>
      </div>

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {STEPS.map((n) => (
          <li
            key={n}
            className="flex items-center gap-4 rounded-xl border border-border-strong bg-surface-raised p-4 shadow-sm"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center self-start rounded-full btn-glass font-mono text-sm font-semibold"
            >
              {n}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-sm font-semibold uppercase leading-snug tracking-wide text-navy">
                <span className="sr-only">{t("stepLabel", { n })}: </span>
                {t(`step${n}`)}
              </p>
              {(n === 3 || n === 5 || n === 6) && (
                <p className="mt-1 text-xs text-muted">
                  {t.rich(`step${n}Note`, {
                    v: (chunks) => <LtrValue className="font-mono">{chunks}</LtrValue>,
                  })}
                </p>
              )}
            </div>
            <div className="relative h-24 w-20 shrink-0 sm:h-28 sm:w-24">
              <Image
                src={`/howToUse/image_${n}.png`}
                alt=""
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs text-muted">{t("researchNote")}</p>
    </section>
  );
}
