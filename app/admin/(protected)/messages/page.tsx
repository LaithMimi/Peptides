import { listInboundMessages } from "@/lib/db/queries/messages";
import { setMessageRead } from "@/app/admin/actions/messages";
import { adminGhostButton } from "@/components/admin/admin-form";

export const metadata = { title: "Messages" };

const TYPE_LABEL: Record<string, string> = {
  delete: "Delete my data",
  access: "Access my data",
  correct: "Correct my data",
};

export default async function AdminMessagesPage() {
  const messages = await listInboundMessages();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">Messages</h1>
      <p className="text-muted">Customer feedback and privacy requests. Reply to the customer by email.</p>

      {messages.length === 0 ? (
        <p className="text-muted">No messages yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`flex flex-col gap-2 rounded-xl border p-5 ${
                m.isRead ? "border-border-strong bg-surface" : "border-navy bg-surface-raised"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                  {m.kind === "feedback"
                    ? "Feedback"
                    : `Data request: ${TYPE_LABEL[m.requestType ?? ""] ?? m.requestType}`}
                  {!m.isRead && " · New"}
                </span>
                <time className="font-mono text-xs text-muted" dateTime={m.createdAt.toISOString()}>
                  {m.createdAt.toISOString().slice(0, 16).replace("T", " ")} · {m.locale}
                </time>
              </div>
              <p className="text-navy">
                {m.name ? `${m.name} ` : ""}
                <a href={`mailto:${m.email}`} className="underline hover:text-accent">
                  {m.email}
                </a>
              </p>
              {m.orderPhone && <p className="text-sm text-muted">Phone used on orders: {m.orderPhone}</p>}
              {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
              <form
                action={async () => {
                  "use server";
                  await setMessageRead(m.id, !m.isRead);
                }}
              >
                <button type="submit" className={adminGhostButton}>
                  {m.isRead ? "Mark as unread" : "Mark as read"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
