import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CvPage from "./page";

describe("CvPage", () => {
  it("prints graph-backed identity, experience metrics, and selected projects", () => {
    render(<CvPage />);
    expect(screen.getByRole("heading", { name: "CV" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Anish Akode" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Print \/ Save as PDF/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Junior Data & Cloud Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/30% fewer API integration defects/i)).toBeInTheDocument();
    expect(screen.getByText(/MLOps Governance Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/MSc Data Science/i)).toBeInTheDocument();
    expect(screen.queryByText(/anishakode2002@gmail.com/i)).not.toBeInTheDocument();
  });
});
