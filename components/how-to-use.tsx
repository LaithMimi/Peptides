import { getTranslations } from "next-intl/server";
import { LtrValue } from "@/components/ltr-value";

/**
 * Small line-art step icons (currentColor) — deliberately plain, one shared
 * stroke style, no photos: the storefront's "no AI-generated images" rule.
 */
function Vial({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <rect x="20" y="8" width="16" height="6" rx="2" />
      <path d="M22 14v4M34 14v4" />
      <rect x="18" y="18" width="20" height="30" rx="4" />
      <path d="M18.5 32h19" opacity="0.5" />
      {children}
    </>
  );
}

const ICONS: Record<number, React.ReactNode> = {
  // cap lifting off the vial
  1: (
    <>
      <rect x="18" y="26" width="20" height="24" rx="4" />
      <path d="M18.5 38h19" opacity="0.5" />
      <rect x="20" y="4" width="16" height="6" rx="2" transform="rotate(-18 28 7)" />
      <path d="M46 20V8M42 12l4-4 4 4" />
    </>
  ),
  // swab over stopper
  2: (
    <>
      <Vial />
      <rect x="34" y="2" width="16" height="12" rx="2" transform="rotate(14 42 8)" />
      <path d="M38 6l8 4" opacity="0.5" />
    </>
  ),
  // syringe drawing from a vial
  3: (
    <>
      <rect x="6" y="26" width="18" height="24" rx="3" />
      <path d="M6.5 36h17" opacity="0.5" />
      <path d="M44 6l6 6M30 20l16-14 4 4-14 16zM30 20l-6 12" />
      <path d="M24 32l-3 3" />
    </>
  ),
  // injecting down the inner wall
  4: (
    <>
      <rect x="14" y="20" width="22" height="32" rx="4" transform="rotate(12 25 36)" />
      <path d="M40 4l8 8M32 12l14-8 4 4-8 14z" />
      <path d="M28 46c-2 3-3 5-3 7a3 3 0 0 0 6 0c0-2-1-4-3-7z" />
    </>
  ),
  // swirl arrows
  5: (
    <>
      <Vial />
      <path d="M8 40a20 20 0 0 0 12 8M48 24a20 20 0 0 0-12-8" />
      <path d="M20 48l-5 1 1-5M36 16l5-1-1 5" />
    </>
  ),
  // snowflake / fridge
  6: (
    <>
      <path d="M28 4v48M6 16l44 24M6 40l44-24" />
      <path d="M23 8l5 4 5-4M23 48l5-4 5 4" />
    </>
  ),
};

export async function HowToUse() {
  const t = await getTranslations("howToUse");
  const steps = [1, 2, 3, 4, 5, 6] as const;

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
        {steps.map((n) => (
          <li
            key={n}
            className="flex items-center gap-4 rounded-xl border border-border-strong bg-surface-raised p-4 shadow-sm"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center self-start rounded-full bg-navy font-mono text-sm font-semibold text-white"
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
            <svg
              viewBox="0 0 56 56"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-14 shrink-0 text-accent"
              aria-hidden="true"
            >
              {ICONS[n]}
            </svg>
          </li>
        ))}
      </ol>

      <p className="text-xs text-muted">{t("researchNote")}</p>
    </section>
  );
}
