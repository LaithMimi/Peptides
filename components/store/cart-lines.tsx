"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/money";
import { LtrValue } from "@/components/ltr-value";
import { VialGlyph } from "@/components/vial-glyph";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import type { DisplayLine } from "@/components/store/use-priced-cart";

/**
 * The cart's line items. With `editable` each line has a quantity stepper and a
 * remove button (cart page); without it the lines are a read-only review
 * (checkout).
 */
export function CartLines({
  lines,
  maxQuantity,
  editable,
  onQuantity,
  onRemove,
}: {
  lines: DisplayLine[];
  maxQuantity: number;
  editable: boolean;
  onQuantity?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}) {
  const t = useTranslations("cart");
  const locale = useLocale();

  return (
    <ul className="flex flex-col gap-3">
      {lines.map((line) => {
        const blocked = line.status !== "ok";
        return (
          <li
            key={line.productId}
            className={`flex flex-col gap-3 rounded-xl border bg-surface p-3 sm:flex-row sm:items-center sm:p-4 ${
              blocked ? "border-2 border-dashed border-border-strong" : "border-border-strong"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt=""
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <VialGlyph className="size-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {line.pending ? (
                  <p className="text-sm text-muted">{t("loadingLine")}</p>
                ) : line.status === "unavailable" ? (
                  <p className="font-semibold text-navy">{t("unavailableLine")}</p>
                ) : (
                  <>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {line.brand}
                      {line.vialSize && (
                        <>
                          {" · "}
                          <LtrValue>{line.vialSize}</LtrValue>
                        </>
                      )}
                    </p>
                    {line.href ? (
                      <Link
                        href={line.href}
                        className="font-serif text-base font-semibold uppercase tracking-wide text-navy hover:text-accent"
                      >
                        {line.name}
                      </Link>
                    ) : (
                      <span className="font-serif text-base font-semibold uppercase tracking-wide text-navy">
                        {line.name}
                      </span>
                    )}
                    {line.unitPriceMinor !== null && (
                      <p className="text-sm text-muted">
                        {t("unitPrice")}:{" "}
                        <bdi dir="ltr" className="font-mono">
                          {formatMoney(line.unitPriceMinor, locale)}
                        </bdi>
                      </p>
                    )}
                  </>
                )}
                {line.status === "unpriced" && !line.pending && (
                  <p className="mt-1 text-sm text-navy">
                    {t("unpricedLine", { name: line.name })}{" "}
                    <Link href="/contact" className="font-semibold underline hover:text-accent">
                      {t("contactStore")}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              {editable && !line.pending && line.status !== "unavailable" ? (
                <QuantityStepper
                  value={line.quantity}
                  max={maxQuantity}
                  name={line.name}
                  onChange={(q) => onQuantity?.(line.productId, q)}
                />
              ) : (
                <span className="font-mono text-sm text-muted">
                  {t("quantity")}: {line.quantity}
                </span>
              )}
              {line.lineTotalMinor !== null && (
                <span className="min-w-20 text-end font-semibold text-navy">
                  <bdi dir="ltr" className="font-mono">
                    {formatMoney(line.lineTotalMinor, locale)}
                  </bdi>
                </span>
              )}
              {editable && (
                <button
                  type="button"
                  onClick={() => onRemove?.(line.productId)}
                  aria-label={t("removeItem", { name: line.name || t("thisItem") })}
                  className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-4 font-serif text-xs font-semibold uppercase tracking-wide text-navy hover:border-navy"
                >
                  {t("remove")}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
