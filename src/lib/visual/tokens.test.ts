import { describe, expect, it } from "vitest";
import {
  CONTRAST_PAIRS,
  EVIDENCE_STATE_TOKEN_STEMS,
  SEMANTIC_TOKEN_NAMES,
  TOKEN_HEX,
  contrastRatio,
  parseRootHexTokens,
} from "@/lib/visual/tokens";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalsCss = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("M3 visual contracts", () => {
  it("defines required semantic token names in globals.css", () => {
    for (const name of SEMANTIC_TOKEN_NAMES) {
      expect(globalsCss.includes(name), `missing ${name}`).toBe(true);
    }
  });

  it("defines evidence-state token stems for every badge state family", () => {
    for (const stem of EVIDENCE_STATE_TOKEN_STEMS) {
      expect(globalsCss.includes(`--state-${stem}-fg`), stem).toBe(true);
      expect(globalsCss.includes(`--state-${stem}-bg`), stem).toBe(true);
      expect(globalsCss.includes(`--state-${stem}-border`), stem).toBe(true);
    }
  });

  it("keeps TOKEN_HEX in sync with :root hex values in globals.css", () => {
    const cssTokens = parseRootHexTokens(globalsCss);
    for (const [key, hex] of Object.entries(TOKEN_HEX)) {
      expect(cssTokens[key], `CSS missing --${key}`).toBeDefined();
      expect(cssTokens[key], `--${key}`).toBe(hex.toLowerCase());
    }
  });

  it("keeps critical colour pairs above WCAG AA text contrast", () => {
    for (const pair of CONTRAST_PAIRS) {
      const ratio = contrastRatio(pair.foreground, pair.background);
      expect(ratio, pair.name).toBeGreaterThanOrEqual(pair.minRatio);
    }
  });

  it("includes a11y media baselines and focus/print chrome contracts", () => {
    expect(globalsCss).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(globalsCss).toMatch(/forced-colors:\s*active/);
    expect(globalsCss).toMatch(/prefers-contrast:\s*more/);
    expect(globalsCss).toMatch(/:focus-visible/);
    expect(globalsCss).toMatch(/@media print/);
    expect(globalsCss).toMatch(/\.site-chrome/);
  });

  it("does not introduce purple/neon-style hex accents in token sheet", () => {
    expect(globalsCss.toLowerCase()).not.toMatch(/#7c3aed|#a855f7|#8b5cf6|neon/);
  });

  it("references no custom property it never defines", () => {
    // An undefined var() does not error — the whole declaration is dropped, so
    // a typo silently removes styling instead of failing loudly. This is the
    // only thing that notices.
    const defined = new Set(
      [...globalsCss.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]),
    );
    // next/font injects its variables on <html> rather than into this sheet,
    // so read the real names from the layout instead of hardcoding them.
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    const external = new Set(
      [...layout.matchAll(/variable:\s*"(--[a-z0-9-]+)"/gi)].map((m) => m[1]),
    );
    expect(external.size).toBeGreaterThan(0);

    const referenced = [...globalsCss.matchAll(/var\((--[a-z0-9-]+)/gi)].map((m) => m[1]);
    expect(referenced.length).toBeGreaterThan(0);

    const missing = [...new Set(referenced)].filter(
      (name) => !defined.has(name) && !external.has(name),
    );
    expect(missing, `undefined custom properties: ${missing.join(", ")}`).toEqual([]);
  });
});
