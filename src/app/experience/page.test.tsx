import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExperiencePage from "./page";

describe("ExperiencePage — provenance honesty", () => {
  it("shows Cardstack metrics with owner-confirmation note and state badge", () => {
    render(<ExperiencePage />);
    expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(screen.getByText(/Junior Data & Cloud Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Cardstack Consulting Limited/i)).toBeInTheDocument();
    expect(screen.getByText(/30% fewer API integration defects/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero audit failures/i)).toBeInTheDocument();
    expect(screen.getByText(/40% faster incident investigation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/OWNER CONFIRMED PROFESSIONAL/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByText(/Proprietary employer source code is not public/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Evidence state legend/i)).toBeInTheDocument();
  });
});
