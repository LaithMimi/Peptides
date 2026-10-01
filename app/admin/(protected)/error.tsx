"use client";

import { useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { adminButton, adminGhostButton } from "@/components/admin/admin-form";

/**
 * Shown when an admin page fails to load. The admin header and navigation stay
 * usable around it, so one broken screen never locks the admin out of the rest.
 */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="flex max-w-2xl flex-col gap-4">
      <h1 ref={headingRef} tabIndex={-1} className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
        This page couldn&rsquo;t load
      </h1>
      <p className="text-foreground">
        The data behind it didn&rsquo;t come back, usually because the database was briefly unreachable.
        Nothing you saved earlier is affected. Try again, or use the menu above to carry on elsewhere.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => retry())}
          className={adminButton}
        >
          {pending ? "Trying again…" : "Try again"}
        </button>
        <Link href="/admin" className={adminGhostButton}>
          Back to dashboard
        </Link>
      </div>
      {error.digest && (
        <p className="text-sm text-muted">
          If it keeps failing, search the server logs for{" "}
          <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-foreground">{error.digest}</code>.
        </p>
      )}
    </div>
  );
}
