import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InterviewPage from "./page";

describe("Interview page (M21)", () => {
  it("exposes Interview My Work without gating recruiter routes", () => {
    render(<InterviewPage />);
    expect(
      screen.getByRole("heading", { name: "Interview my work" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    for (const label of ["Work", "Experience", "About", "CV", "Contact"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(
      screen.getByRole("button", { name: /BUILD QUESTION SET/i }),
    ).toBeInTheDocument();
  });

  it("does not promise answers or scores in the page framing", () => {
    render(<InterviewPage />);
    expect(screen.queryByText(/answer key/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
  });
});
