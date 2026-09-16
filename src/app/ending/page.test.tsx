import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EndingPage from "./page";
import { getGraph, getProfile } from "@/lib/evidence/queries";

describe("Ending page (M23)", () => {
  it("exposes the Ending Signal without gating recruiter routes", () => {
    render(<EndingPage />);
    expect(screen.getByRole("heading", { name: "Ending signal" })).toBeInTheDocument();
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    for (const label of ["Work", "Experience", "About", "CV", "Contact"]) {
      expect(nav.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("uses canonical contact channels from the graph, not excluded ones", () => {
    const graph = getGraph();
    const profile = getProfile(graph);
    render(<EndingPage />);
    const actions = screen.getByLabelText(/Contact actions/i);
    const href = actions.querySelector('a[href^="mailto:"]')?.getAttribute("href");
    expect(href).toBe(`mailto:${profile.email}`);
    for (const excluded of graph.exclusions.emails) {
      expect(href).not.toContain(excluded);
    }
  });
});
