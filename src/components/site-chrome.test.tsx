import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrimaryNav, SiteFooter } from "./site-chrome-static";
import { RUNTIME_LABS } from "@/lib/labs/catalog";

/**
 * The footer's "locked through Mnn" marker is hand-written, and it has now
 * lagged a lock twice (recorded in M24-LOCK-AUDIT and again at the M27 lock).
 * Nothing about it breaks when it goes stale, so the site quietly understates
 * what has shipped. Bind it to the milestones table, which is the record.
 */
const ROOT = process.cwd();

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

/** Highest milestone marked Locked in the planning table. */
function highestLockedMilestone(): number {
  const table = read("docs/planning/milestones.md");
  const locked = [
    ...table.matchAll(/^\|\s*M(\d+)(?:\.\d+)?\b[^|]*\|\s*Locked\s*\|/gim),
  ].map((match) => Number(match[1]));
  expect(
    locked.length,
    "no Locked rows found — the table format changed",
  ).toBeGreaterThan(0);
  return Math.max(...locked);
}

describe("footer milestone marker", () => {
  it("names the highest milestone the planning table records as locked", () => {
    const expected = highestLockedMilestone();
    const chrome = read("src/components/site-chrome-static.tsx");

    const marker = chrome.match(/locked through M(\d+)/i);
    expect(
      marker,
      "footer no longer carries a 'locked through Mnn' marker",
    ).not.toBeNull();
    expect(
      Number(marker![1]),
      `footer says M${marker![1]} but the milestones table records M${expected} as locked`,
    ).toBe(expected);
  });

  it("is asserted by e2e against the same milestone, not a stale one", () => {
    // The e2e assertion pins the footer string, so if it is edited to match a
    // stale value it starts enforcing the drift instead of catching it.
    const expected = highestLockedMilestone();
    const spec = read("e2e/home.spec.ts");

    const marker = spec.match(/locked through M(\d+)/i);
    expect(marker, "e2e no longer asserts the footer marker").not.toBeNull();
    expect(Number(marker![1])).toBe(expected);
  });

  it("agrees with the README's locked-milestone line", () => {
    const expected = highestLockedMilestone();
    const readme = read("README.md");

    const marker = readme.match(/M(\d+) locked\./i);
    expect(marker, "README no longer states the locked milestone").not.toBeNull();
    expect(Number(marker![1])).toBe(expected);
  });
});

/**
 * Prominence contract.
 *
 * Until this was fixed, Fork and Interview held header buttons while the three
 * Runtime Labs had no top-level entry at all — the most speculative surfaces
 * ranked above the most evidenced ones. These tests pin the corrected order so
 * it cannot quietly invert again.
 */
describe("navigation prominence", () => {
  const RECRUITER_PATH = ["/work", "/experience", "/about", "/cv", "/contact"];

  it("keeps the whole recruiter path in the primary nav", () => {
    render(<PrimaryNav />);
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    for (const route of RECRUITER_PATH) {
      expect(hrefs, `${route} left the primary nav`).toContain(route);
    }
  });

  it("gives Runtime Labs a top-level entry", () => {
    render(<PrimaryNav />);
    expect(screen.getByRole("link", { name: "Labs" })).toHaveAttribute("href", "/labs");
  });

  it("does not promote Fork or Interview into the primary nav", () => {
    render(<PrimaryNav />);
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    expect(hrefs).not.toContain("/fork");
    expect(hrefs).not.toContain("/interview");
  });

  it("keeps the header free of the experimental surfaces", () => {
    // Asserted against source because SiteHeader reads the Evidence Graph.
    const header = read("src/components/site-chrome.tsx");
    expect(header).not.toMatch(/href="\/fork"/);
    expect(header).not.toMatch(/href="\/interview"/);
  });

  it("still reaches all four session surfaces from the footer", () => {
    render(<SiteFooter />);
    const nav = screen.getByRole("navigation", { name: "Session surfaces" });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );

    // Demoting them must not orphan them — /fork and /interview are noindex, so
    // a lost link would make them unreachable by both visitors and crawlers.
    expect(hrefs).toEqual(
      expect.arrayContaining(["/fork", "/interview", "/surface", "/ending"]),
    );
  });

  it("routes the nav entry at the index that lists every lab", () => {
    expect(RUNTIME_LABS.length).toBeGreaterThan(0);
    for (const lab of RUNTIME_LABS) {
      expect(lab.href.startsWith("/labs/")).toBe(true);
    }
  });
});
