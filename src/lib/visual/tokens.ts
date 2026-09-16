/**
 * Editorial Lab visual contracts (M3).
 * Hex values here MUST match `:root` in `src/app/globals.css` (enforced by tests).
 */

export const SEMANTIC_TOKEN_NAMES = [
  "--surface",
  "--on-surface",
  "--muted",
  "--stroke",
  "--focus-ring",
  "--action",
  "--on-action",
  "--measure",
  "--font-sans",
  "--font-mono",
] as const;

/** Evidence-state token stems under :root — paired with text labels in UI. */
export const EVIDENCE_STATE_TOKEN_STEMS = [
  "verified-code",
  "verified-doc",
  "owner-confirmed",
  "resume",
  "prior",
  "extension",
  "limited",
  "not-demonstrated",
] as const;

export type EvidenceStateTokenStem = (typeof EVIDENCE_STATE_TOKEN_STEMS)[number];

/** Canonical hex map — sync source for CONTRAST_PAIRS + CSS assert. */
export const TOKEN_HEX = {
  surface: "#f4f4f2",
  "on-surface": "#1a1a1a",
  muted: "#4a4a46",
  stroke: "#cfcfc8",
  "focus-ring": "#1a1a1a",
  action: "#1a1a1a",
  "on-action": "#f4f4f2",
  measure: "#b8b8b0",
  "state-verified-code-fg": "#0f3d2e",
  "state-verified-code-bg": "#e7f2ec",
  "state-verified-doc-fg": "#0f2f4a",
  "state-verified-doc-bg": "#e6eef6",
  "state-owner-confirmed-fg": "#5c3b00",
  "state-owner-confirmed-bg": "#f7efd9",
  "state-resume-fg": "#3f3f3c",
  "state-resume-bg": "#ecece8",
  "state-prior-fg": "#3f3f3c",
  "state-prior-bg": "#ecece8",
  "state-extension-fg": "#2a3340",
  "state-extension-bg": "#e8ecf0",
  "state-limited-fg": "#6b2e00",
  "state-limited-bg": "#f6e8dc",
  "state-not-demonstrated-fg": "#3f3f3c",
  "state-not-demonstrated-bg": "#ecece8",
} as const;

/** Hex pairs — WCAG AA for normal text (≥ 4.5:1). */
export const CONTRAST_PAIRS: ReadonlyArray<{
  name: string;
  foreground: string;
  background: string;
  minRatio: number;
}> = [
  {
    name: "on-surface / surface",
    foreground: TOKEN_HEX["on-surface"],
    background: TOKEN_HEX.surface,
    minRatio: 4.5,
  },
  {
    name: "muted / surface",
    foreground: TOKEN_HEX.muted,
    background: TOKEN_HEX.surface,
    minRatio: 4.5,
  },
  {
    name: "on-action / action",
    foreground: TOKEN_HEX["on-action"],
    background: TOKEN_HEX.action,
    minRatio: 4.5,
  },
  {
    name: "verified-code fg/bg",
    foreground: TOKEN_HEX["state-verified-code-fg"],
    background: TOKEN_HEX["state-verified-code-bg"],
    minRatio: 4.5,
  },
  {
    name: "verified-doc fg/bg",
    foreground: TOKEN_HEX["state-verified-doc-fg"],
    background: TOKEN_HEX["state-verified-doc-bg"],
    minRatio: 4.5,
  },
  {
    name: "owner-confirmed fg/bg",
    foreground: TOKEN_HEX["state-owner-confirmed-fg"],
    background: TOKEN_HEX["state-owner-confirmed-bg"],
    minRatio: 4.5,
  },
  {
    name: "resume fg/bg",
    foreground: TOKEN_HEX["state-resume-fg"],
    background: TOKEN_HEX["state-resume-bg"],
    minRatio: 4.5,
  },
  {
    name: "prior fg/bg",
    foreground: TOKEN_HEX["state-prior-fg"],
    background: TOKEN_HEX["state-prior-bg"],
    minRatio: 4.5,
  },
  {
    name: "extension fg/bg",
    foreground: TOKEN_HEX["state-extension-fg"],
    background: TOKEN_HEX["state-extension-bg"],
    minRatio: 4.5,
  },
  {
    name: "limited fg/bg",
    foreground: TOKEN_HEX["state-limited-fg"],
    background: TOKEN_HEX["state-limited-bg"],
    minRatio: 4.5,
  },
  {
    name: "not-demonstrated fg/bg",
    foreground: TOKEN_HEX["state-not-demonstrated-fg"],
    background: TOKEN_HEX["state-not-demonstrated-bg"],
    minRatio: 4.5,
  },
];

export function relativeLuminance(hex: string): number {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Parse simple `:root { --token: #hex; }` declarations from CSS. */
export function parseRootHexTokens(css: string): Record<string, string> {
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!rootMatch) return {};
  const body = rootMatch[1];
  const out: Record<string, string> = {};
  const re = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    out[m[1]] = m[2].toLowerCase();
  }
  return out;
}
