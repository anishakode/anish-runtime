import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ForkPage from "./page";

describe("Fork page (M20)", () => {
  it("exposes Fork Anish without gating recruiter routes", () => {
    render(<ForkPage />);
    expect(screen.getByRole("heading", { name: "Fork Anish" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    for (const label of ["Work", "Experience", "About", "CV", "Contact"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/Job description/i)).toBeInTheDocument();
  });
});
