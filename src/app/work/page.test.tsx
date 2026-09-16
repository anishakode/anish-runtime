import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TierSection } from "@/components/tier-section";
import WorkPage from "./page";

describe("WorkPage — evidence-first listing", () => {
  it("lists all flagship projects with evidence badges", () => {
    render(<WorkPage />);
    expect(screen.getByRole("heading", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Flagship" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "MLOps Governance Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Steward_AI" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "MLOps Governance Dashboard" }),
    ).toHaveAttribute("href", "/work/mlops-governance-dashboard");
    expect(screen.getAllByText(/PUBLIC CODE VERIFIED/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Evidence state legend/i)).toBeInTheDocument();
  });

  it("keeps supporting and archive tiers non-empty from corpus", () => {
    render(<WorkPage />);
    expect(screen.getByRole("heading", { name: "Supporting" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Archive" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Boring_AI" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Netflix Clone" })).toBeInTheDocument();
    expect(screen.queryByText(/No supporting projects/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No archive projects/i)).not.toBeInTheDocument();
  });

  it("renders empty-tier copy when a tier has no projects", () => {
    render(<TierSection id="empty-tier" label="Supporting" projects={[]} />);
    expect(screen.getByText("No supporting projects.")).toBeInTheDocument();
  });
});
