import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("renders profile and both education records from the graph", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
    expect(screen.getByText("Anish Akode")).toBeInTheDocument();
    expect(screen.getByText(/Manchester, UK/i)).toBeInTheDocument();
    expect(screen.getByText(/MSc Data Science/i)).toBeInTheDocument();
    expect(screen.getByText(/University of Hertfordshire/i)).toBeInTheDocument();
    expect(screen.getByText(/BTech Computer Science/i)).toBeInTheDocument();
    expect(screen.getAllByText(/RESUME DOCUMENTED/i).length).toBeGreaterThan(0);
  });
});
