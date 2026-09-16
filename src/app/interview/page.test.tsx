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

  it("states the answer-key boundary before any question set exists", () => {
    render(<InterviewPage />);
    // The boundary is a refusal, not a promise, so it belongs on the page from
    // the first paint — a visitor who never builds a set should still read it.
    const answerKey = screen.getByLabelText(/Answer key/i);
    expect(answerKey).toHaveTextContent("Not generated.");
    expect(answerKey).toHaveTextContent(
      "It will not manufacture Anish's interview answer.",
    );
  });

  it("promises no answer, score, or ranking in the page framing", () => {
    render(<InterviewPage />);
    for (const forbidden of [
      /model answer/i,
      /candidate score/i,
      /fit score/i,
      /hiring score/i,
      /culture fit/i,
      /ranking/i,
    ]) {
      expect(screen.queryByText(forbidden), String(forbidden)).not.toBeInTheDocument();
    }
  });
});
