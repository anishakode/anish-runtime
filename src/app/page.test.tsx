import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage — recruiter contracts", () => {
  it("exposes identity and recruiter CTAs from the Evidence Graph without running", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Anish Akode" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/AI · ML · Software Engineering/i).length).toBeGreaterThan(
      0,
    );

    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const [label, href] of [
      ["Work", "/work"],
      ["Experience", "/experience"],
      ["About", "/about"],
      ["CV", "/cv"],
      ["Contact", "/contact"],
    ] as const) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }

    expect(screen.getByRole("button", { name: "RUN ANISH" })).toHaveClass("btn-primary");
    expect(screen.getByRole("link", { name: /View work/i })).toHaveAttribute(
      "href",
      "/work",
    );
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveClass(
      "skip-link",
    );
    expect(screen.getByText(/40 nodes/i)).toBeInTheDocument();
  });

  it("does not expose the excluded obsolete email", () => {
    render(<HomePage />);
    expect(screen.queryByText(/anishakode2002@gmail.com/i)).not.toBeInTheDocument();
  });
});
