/**
 * Isolates a Latin/numeric value (e.g. "10 mg", "≥ 99%") from the
 * surrounding text's bidi direction, so it doesn't visually reverse when
 * embedded in Arabic (RTL) copy. Use for any unit, batch code, or
 * measurement rendered inside translated text.
 */
export function LtrValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  );
}
