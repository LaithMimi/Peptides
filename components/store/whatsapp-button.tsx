import { whatsappLink } from "@/lib/whatsapp";

/** WhatsApp link button. Renders nothing when no usable number is configured. */
export function WhatsAppButton({
  number,
  message,
  label,
  variant = "solid",
}: {
  number: string | null | undefined;
  message?: string;
  label: string;
  variant?: "solid" | "outline";
}) {
  const href = whatsappLink(number, message);
  if (!href) return null;

  const style =
    variant === "solid"
      ? "bg-navy text-navy-foreground hover:opacity-90"
      : "border-2 border-navy text-navy hover:bg-navy hover:text-navy-foreground";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 w-fit items-center justify-center rounded-full px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide transition-colors ${style}`}
    >
      {label}
    </a>
  );
}
