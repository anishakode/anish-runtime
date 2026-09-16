"use client";

/**
 * Last-resort boundary (M24) — replaces the root layout, so it ships its own
 * document shell and cannot rely on site chrome or fonts being mounted.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "3rem 1.5rem",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          lineHeight: 1.6,
        }}
      >
        <main id="main" style={{ maxWidth: "40rem", margin: "0 auto" }}>
          <p style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Runtime fault
          </p>
          <h1>The application failed to render</h1>
          <p>
            This is a fault in the site itself, not in the evidence behind it. Nothing
            about this session was stored.
          </p>
          <p>
            <button type="button" onClick={reset} style={{ padding: "0.5rem 1rem" }}>
              TRY AGAIN
            </button>
          </p>
          {/* Plain anchors on purpose: this boundary runs when the app itself failed,
              so a full document load is more reliable than client-side routing. */}
          <p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/work">Browse work</a> · <a href="/cv">Read the CV</a> ·{" "}
            <a href="/contact">Contact</a>
          </p>
          {error.digest ? (
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
              fault digest: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
