"use client";

import { ViewTransition } from "react";
import { useTranslations } from "next-intl";

/**
 * Loading placeholders for storefront routes. Each mirrors the layout of the
 * page it stands in for, so the real content lands where the eye already is
 * instead of jumping. The pulse runs only when motion is welcome.
 */

/** One placeholder block. */
export function Bone({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`rounded bg-navy/10 ${className}`} />;
}

function SkeletonFrame({ children }: { children: React.ReactNode }) {
  const t = useTranslations("site");
  return (
    // When the page resolves, the skeleton fades out of the way before the
    // real content racks into focus (see .skeleton-exit / .page-enter).
    <ViewTransition exit="skeleton-exit" default="none">
      <div className="motion-safe:animate-pulse" role="status" aria-busy="true">
        <span className="sr-only">{t("loading")}</span>
        {children}
      </div>
    </ViewTransition>
  );
}

/** Listing pages: heading, intro line and a product grid. */
export function GridSkeleton() {
  return (
    <SkeletonFrame>
      <div className="flex flex-col gap-6">
        <Bone className="h-10 w-2/3 max-w-md rounded-lg" />
        <Bone className="h-5 w-1/2 max-w-sm" />
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Bone key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      </div>
    </SkeletonFrame>
  );
}

/** Product detail: square image at the start, title, price and facts beside it. */
export function ProductDetailSkeleton() {
  return (
    <SkeletonFrame>
      <div className="flex flex-col gap-6">
        <Bone className="h-4 w-28" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <Bone className="aspect-square w-full max-w-sm rounded-xl max-md:mx-auto" />
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Bone className="h-3 w-24" />
              <Bone className="h-10 w-4/5 rounded-lg" />
            </div>
            <Bone className="h-9 w-32 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-11/12" />
              <Bone className="h-4 w-3/5" />
            </div>
            <Bone className="h-20 w-full rounded-lg" />
            <Bone className="h-12 w-full max-w-xs rounded-full" />
          </div>
        </div>
      </div>
    </SkeletonFrame>
  );
}

/** Text pages (About, legal): a title and paragraphs at reading width. */
export function ProseSkeleton() {
  return (
    <SkeletonFrame>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Bone className="mb-2 h-10 w-1/2 rounded-lg" />
        {[0, 1, 2].map((p) => (
          <div key={p} className="flex flex-col gap-2 pb-3">
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </SkeletonFrame>
  );
}

/** Order confirmation: the centered receipt panel, then the item list. */
export function OrderSkeleton() {
  return (
    <SkeletonFrame>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border-strong p-6">
          <Bone className="size-16 rounded-full" />
          <Bone className="h-9 w-2/3 rounded-lg" />
          <Bone className="h-4 w-1/2" />
          <Bone className="h-4 w-40" />
        </div>
        {[0, 1].map((i) => (
          <Bone key={i} className="h-20 w-full rounded-xl" />
        ))}
        <Bone className="h-28 w-full rounded-xl" />
      </div>
    </SkeletonFrame>
  );
}
