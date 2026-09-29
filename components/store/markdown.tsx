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
        h1: ({ children }) => (
          <h2 className="mt-4 font-serif text-xl font-semibold text-navy">{children}</h2>
        ),
        h2: ({ children }) => (
          <h2 className="mt-4 font-serif text-xl font-semibold text-navy">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-3 font-serif text-lg font-semibold text-navy">{children}</h3>
        ),
        p: ({ children }) => <p className="leading-relaxed text-foreground">{children}</p>,
        ul: ({ children }) => <ul className="list-disc space-y-1 ps-6 text-foreground">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal space-y-1 ps-6 text-foreground">{children}</ol>,
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
