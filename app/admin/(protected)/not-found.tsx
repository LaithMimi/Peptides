import Link from "next/link";
import { adminGhostButton } from "@/components/admin/admin-form";

/** Shown for an admin record that no longer exists (deleted, or a stale link). */
export default function AdminNotFound() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">That item no longer exists</h1>
      <p className="text-foreground">
        It may have been deleted, or the link you followed is out of date. Open its section from the menu above to see what&rsquo;s there now.
      </p>
      <Link href="/admin" className={`${adminGhostButton} w-fit`}>
        Back to dashboard
      </Link>
    </div>
  );
}
