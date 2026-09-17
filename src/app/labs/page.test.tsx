import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LabsPage, { metadata } from "./page";
import { RUNTIME_LABS } from "@/lib/labs/catalog";

describe("/labs index", () => {
  it("lists all three labs, each linking to its own route", () => {
    render(<LabsPage />);
    const list = screen.getByRole("list", { name: "Runtime Labs" });
    expect(list.children).toHaveLength(3);

    for (const lab of RUNTIME_LABS) {
      expect(
        screen.getByRole("link", { name: new RegExp(lab.label, "i") }),
      ).toHaveAttribute("href", lab.href);
    }
  });

  it("badges every lab as PORTFOLIO_EXTENSION on the index itself", () => {
    render(<LabsPage />);
    // The badge has to be on the index, not only inside each lab. A visitor
    // choosing from this page decides what to open before seeing any label.
    expect(screen.getAllByText(/PORTFOLIO EXTENSION/i)).toHaveLength(3);
  });

  it("states that the recruiter path does not require any lab", () => {
    render(<LabsPage />);
    expect(
      screen.getByText(/carry the full professional record without running any of them/i),
    ).toBeInTheDocument();
    for (const href of ["/work", "/experience", "/cv"]) {
      expect(
        screen.getAllByRole("link").some((a) => a.getAttribute("href") === href),
      ).toBe(true);
    }
  });

  it("claims no production telemetry anywhere on the page", () => {
    const { container } = render(<LabsPage />);
    const text = container.textContent ?? "";
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toMatch(/\buptime\b|\bSLA\b|\bGrafana\b/i);
  });

  it("declares a canonical URL and an indexable title", () => {
    expect(metadata.alternates.canonical).toBe("/labs");
    expect(metadata.title).toBe("Runtime Labs");
    expect(metadata).not.toHaveProperty("robots");
  });
});
