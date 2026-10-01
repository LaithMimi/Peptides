import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { CONTACT } from "@/lib/contact";

const STEPS = ["new", "processing", "out_for_delivery", "completed"] as const;
type OrderStatus = (typeof STEPS)[number] | "cancelled";

/**
 * The order's real status, drawn as the logo's peptide dot-chain: one node
 * per state of the order state machine, bonded up to the current one. The
 * confirmation page is rendered per request, so revisiting its link always
 * shows the latest status. The bonds link up once on arrival (CSS, skipped
 * under reduced motion); the chain is fully drawn without it.
 */
export async function OrderProgress({ status }: { status: OrderStatus }) {
  const t = await getTranslations("confirmation.progress");

  if (status === "cancelled") {
    return (
      <section
        aria-labelledby="order-progress"
        className="flex flex-col gap-1 rounded-xl border border-border-strong bg-surface p-4"
      >
        <h2 id="order-progress" className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          {t("title")}
        </h2>
        <p className="text-foreground">
          {t.rich("cancelled", {
            email: (chunks) => (
              <a href={`mailto:${CONTACT.email}`} className="font-semibold text-navy underline hover:text-accent">
                {chunks}
              </a>
            ),
          })}
        </p>
      </section>
    );
  }

  const current = STEPS.indexOf(status);

  return (
    <section
      aria-labelledby="order-progress"
      className="flex flex-col gap-4 rounded-xl border border-border-strong bg-surface p-4 sm:p-6"
    >
      <h2 id="order-progress" className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
        {t("title")}
      </h2>
      {/* On a fresh order the chain waits for the vial to seal; on a revisit it links up at once. */}
      <ol
        className="grid grid-cols-4"
        style={{ "--chain-delay": status === "new" ? "1100ms" : "150ms" } as CSSProperties}
      >
        {STEPS.map((step, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const reached = i <= current;
          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex flex-col items-center gap-2 px-1 text-center"
            >
              {i > 0 && (
                // Bond from the previous node's centre to this one's.
                <span
                  aria-hidden="true"
                  className={`absolute top-[11px] end-1/2 h-0.5 w-full ${
                    reached ? "chain-bond bg-navy" : "chain-bond-pending"
                  }`}
                  style={reached ? ({ "--i": i } as CSSProperties) : undefined}
                />
              )}
              <span aria-hidden="true" className="relative z-10 flex size-6 items-center justify-center">
                {isCurrent ? (
                  <span
                    className="chain-node-current size-6 rounded-full bg-accent ring-4 ring-accent/20"
                    style={{ "--i": i } as CSSProperties}
                  />
                ) : done ? (
                  <span className="size-3.5 rounded-full bg-navy" />
                ) : (
                  <span className="size-3.5 rounded-full border-2 border-border-strong bg-surface" />
                )}
              </span>
              <span
                className={`text-balance font-mono text-xs uppercase leading-tight sm:tracking-wider ${
                  isCurrent ? "font-semibold text-navy" : reached ? "text-foreground" : "text-muted"
                }`}
              >
                {t(step)}
                {done && <span className="sr-only"> — {t("done")}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-muted">{t("hint")}</p>
    </section>
  );
}
