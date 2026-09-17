import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageShell } from "@/components/page-shell";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-chrome-static";
import type { Project } from "@/lib/evidence/queries";

/**
 * Layout contracts for the alignment class of bugs:
 * - nested max-widths that stagger a column's right edge
 * - status text stuffed into flex-wrap nav rows
 * - items-center against multi-line peers
 *
 * These are structural assertions against source / DOM classNames, because the
 * visual defect is invisible to most functional tests.
 */
const ROOT = process.cwd();

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("layout measure contracts", () => {
  it("PageShell lets the header column own the measure, not .page-lede", () => {
    render(
      <PageShell title="Work" description="A long description that used to stop early.">
        <p>body</p>
      </PageShell>,
    );
    const lede = screen.getByText(/A long description/);
    expect(lede.className).toMatch(/\bpage-lede\b/);
    expect(lede.className).toMatch(/\bmax-w-none\b/);
    expect(lede.closest("header")?.className).toMatch(/\bmax-w-3xl\b/);
  });

  it("ProjectCard does not cap the summary narrower than the title", () => {
    const project = {
      id: "proj.test",
      slug: "test",
      title: "Test Project",
      tier: "flagship",
      summary: "Summary that must share the card width with the title and themes.",
      evidenceState: "PUBLIC_CODE_VERIFIED",
      themes: ["mlops"],
      repo: "anishakode/test",
    } as Project;

    render(<ProjectCard project={project} />);
    const summary = screen.getByText(/share the card width/);
    expect(summary.className).not.toMatch(/max-w-prose|max-w-xl|max-w-md/);
  });

  it("home idle and ready intros share a single max-w-xl column with open gap-8 rhythm", () => {
    const src = read("src/components/home-runtime.tsx");
    // Idle: one wrapper, gap-8 between siblings (live spacing). Nesting into
    // space-y-3 made localhost look compact against production.
    expect(src).toMatch(/phase === "idle"[\s\S]*?max-w-xl flex-col gap-8/);
    expect(src).toMatch(/phase === "ready"[\s\S]*?max-w-xl flex-col gap-8/);
    // Duplicate brand eyebrow under the header was removed.
    expect(src).not.toMatch(
      /phase === "idle"[\s\S]*?<p className="eyebrow">ANISH \/\/ RUNTIME<\/p>/,
    );
  });

  it("home page tops the hero rather than vertically centering it", () => {
    const src = read("src/app/page.tsx");
    expect(src).toMatch(/justify-start/);
    expect(src).not.toMatch(/justify-center/);
  });

  it("header Ask Runtime cluster stacks under the nav on small screens", () => {
    const src = read("src/components/site-chrome.tsx");
    expect(src).toMatch(/flex-col gap-3 sm:flex-row sm:items-start/);
    expect(src).toMatch(/<PrimaryNav \/>[\s\S]*?<AskRuntime/);
  });

  it("footer locked marker stays outside the session nav", () => {
    render(<SiteFooter />);
    const nav = screen.getByRole("navigation", { name: "Session surfaces" });
    expect(nav.textContent).not.toMatch(/locked through/i);
    expect(screen.getByText(/locked through M\d+/i)).toBeInTheDocument();
  });

  it("RecompileBanner roots carry no-print so they cannot enter a CV PDF", () => {
    const src = read("src/components/session/recompile-banner.tsx");
    // Both roots — the consent prompt and the approved status — must opt out of
    // print. Matching each aria-label with its own no-print className.
    expect(src).toMatch(
      /className="[^"]*\bno-print\b[^"]*"[\s\S]*?aria-label="Session recompile active"/,
    );
    expect(src).toMatch(
      /className="[^"]*\bno-print\b[^"]*"[\s\S]*?aria-label="Signal recompile prompt"/,
    );
  });
});
