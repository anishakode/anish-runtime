import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SurfacePage from "./page";

describe("Surface page (M22)", () => {
  it("exposes Under the Surface without gating recruiter routes", () => {
    render(<SurfacePage />);
    expect(
      screen.getByRole("heading", { name: "Under the surface" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    for (const label of ["Work", "Experience", "About", "CV", "Contact"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("shows the runtime trace as unavailable outside the provider rather than faking it", () => {
    render(<SurfacePage />);
    expect(screen.getByText(/Runtime trace UNAVAILABLE/i)).toBeInTheDocument();
  });
});
