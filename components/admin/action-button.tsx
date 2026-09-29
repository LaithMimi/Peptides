"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/app/admin/actions/shared";
import { adminGhostButton, errorMessage } from "@/components/admin/admin-form";

/**
 * Runs a bound Server Action (for example `setBrandActive.bind(null, id, false)`)
 * and refreshes the page. Shows the problem inline if it fails.
 */
export function ActionButton({
  action,
  children,
  confirm,
  className,
}: {
  action: () => Promise<ActionState>;
  children: React.ReactNode;
  confirm?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        className={className ?? adminGhostButton}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setError(null);
          startTransition(async () => {
            const result = await action();
            if (result.ok) router.refresh();
            else setError(errorMessage(result.code) ?? "Failed.");
          });
        }}
      >
        {children}
      </button>
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
