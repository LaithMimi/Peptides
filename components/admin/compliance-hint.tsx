/** Reminder shown wherever an admin writes customer-facing product or research-area copy. */
export function ComplianceHint() {
  return (
    <p
      role="note"
      className="rounded-lg border-2 border-dashed border-border-strong p-3 text-sm text-foreground"
    >
      <strong className="font-semibold">Wording rule:</strong> describe research and laboratory
      focus only. Do not write dosage instructions, medical or therapeutic claims, or anything
      implying human use. All wording must be approved by the client.
    </p>
  );
}
