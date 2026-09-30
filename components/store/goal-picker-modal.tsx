"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { pick } from "@/lib/i18n-fields";
import type { CategoryWithCount } from "@/lib/db/queries/catalog";
import { GOAL_PICKER_EVENT, markGoalPickerSeen, readGoalPickerSeen } from "@/lib/goal-picker";
import { secondaryButtonClass } from "@/components/form-field";

function subscribe(onChange: () => void) {
  window.addEventListener(GOAL_PICKER_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(GOAL_PICKER_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// "unknown" on the server and during hydration so the modal never flashes
// open for a returning visitor who has already made a choice.
const getSnapshot = () => (readGoalPickerSeen() ? "seen" : "unseen");
const getServerSnapshot = () => "unknown";

/**
 * First-visit onboarding: asks a new visitor what they're researching, then
 * routes straight to the matching products on /start. Shown at most once per
 * browser (lib/goal-picker.ts) and never on /start itself, which is this
 * same choice already.
 */
export function GoalPickerModal({ categories }: { categories: CategoryWithCount[] }) {
  const t = useTranslations("goalPicker");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const eligible = state === "unseen" && pathname !== "/start" && categories.length > 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (eligible && !dialog.open) {
      dialog.showModal();
    } else if (!eligible && dialog.open) {
      dialog.close();
    }
  }, [eligible]);

  if (state === "unknown" || categories.length === 0) return null;

  function choose(slug: string) {
    markGoalPickerSeen();
    router.push({ pathname: "/start", query: { purpose: slug } });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="goal-picker-title"
      onClose={markGoalPickerSeen}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="dialog-in goal-picker-dialog m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border-2 border-border-strong bg-surface p-6 shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="goal-picker-title"
            className="font-serif text-xl font-semibold uppercase tracking-wide text-navy"
          >
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          aria-label={t("close")}
          onClick={() => dialogRef.current?.close()}
          className="-m-2 shrink-0 rounded-full p-2 text-muted transition-colors hover:bg-surface-raised hover:text-navy"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {categories.map((category) => {
          const name = pick(category, "name", locale) ?? category.nameEn;
          return (
            <li key={category.slug}>
              <button
                type="button"
                onClick={() => choose(category.slug)}
                className="min-h-11 w-full rounded-xl border-2 border-border-strong bg-surface-raised px-4 py-3 text-start font-serif text-sm font-semibold uppercase tracking-wide text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
              >
                {name}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        className={`${secondaryButtonClass} mt-5`}
      >
        {t("skip")}
      </button>
    </dialog>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
