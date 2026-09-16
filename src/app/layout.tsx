import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { SessionShell } from "@/components/session/session-shell";
import { loadEvidenceGraph } from "@/lib/evidence/load-graph";
import { siteUrl } from "@/lib/seo/routes";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-family",
  display: "swap",
});

const profile = loadEvidenceGraph().profile;
const description = `${profile.tagline} ${profile.positioning}.`;
const site = siteUrl();

export const metadata: Metadata = {
  // Absolute URLs resolve only once an origin is configured; unset stays relative.
  ...(site === "" ? {} : { metadataBase: new URL(site) }),
  title: { default: "ANISH // RUNTIME", template: "%s · ANISH // RUNTIME" },
  description,
  applicationName: "ANISH // RUNTIME",
  authors: [{ name: profile.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    siteName: "ANISH // RUNTIME",
    title: `${profile.name} — ${profile.tagline}`,
    description,
    ...(site === "" ? {} : { url: site }),
  },
  twitter: {
    // A 1200×630 card exists from M26, so the large format is the honest declaration.
    card: "summary_large_image",
    title: `${profile.name} — ${profile.tagline}`,
    description,
  },
};

/**
 * The palette is a single light theme, so declare it: without `color-scheme` a
 * browser in dark mode inverts form controls and scrollbars against it.
 */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f4f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full ${instrumentSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <SessionShell>{children}</SessionShell>
      </body>
    </html>
  );
}
