import ReactMarkdown from "react-markdown";

/**
 * Renders admin-written Markdown for the About and legal pages. Raw HTML in the
 * text is not rendered (react-markdown's default), and unsafe link protocols
 * are dropped, so page text cannot inject markup or scripts.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        // Long-form reading: headings stay in sentence case (whole legal
        // clauses in capitals are hard to read) and prose is held to ~70
        // characters inside the wider article column. The cap is in rem, not
        // ch: Geist's wide "0" makes 68ch come out near 96 characters.
        h1: ({ children }) => (
          <h2 className="mt-6 text-balance font-serif text-2xl font-semibold leading-tight text-navy">{children}</h2>
        ),
        h2: ({ children }) => (
          <h2 className="mt-6 text-balance font-serif text-2xl font-semibold leading-tight text-navy">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 text-balance font-serif text-lg font-semibold leading-snug text-navy">{children}</h3>
        ),
        p: ({ children }) => <p className="max-w-[34rem] leading-relaxed text-foreground">{children}</p>,
        ul: ({ children }) => (
          <ul className="max-w-[34rem] list-disc space-y-1.5 ps-6 leading-relaxed text-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="max-w-[34rem] list-decimal space-y-1.5 ps-6 leading-relaxed text-foreground">{children}</ol>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            rel="noopener noreferrer nofollow"
            className="font-semibold text-accent underline underline-offset-2"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
