import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { StewardLab } from "./steward-lab";

describe("StewardLab (M12)", () => {
  it("shows PORTFOLIO_EXTENSION boundary and scenario controls", () => {
    render(<StewardLab />);
    expect(screen.getAllByText(/PORTFOLIO EXTENSION/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Not medical advice/i)).toBeInTheDocument();
    expect(screen.getByText(/No live FHIR/i)).toBeInTheDocument();
    for (const label of [
      /Baseline/i,
      /Remove renal context/i,
      /Allergy conflict/i,
      /Invalid tool input/i,
    ]) {
      expect(screen.getByRole("radio", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("switches to allergy conflict and keeps advice withheld", async () => {
    const user = userEvent.setup();
    render(<StewardLab />);
    await user.click(screen.getByRole("radio", { name: /Allergy conflict/i }));
    expect(screen.getByText(/Allergy conflict flagged/i)).toBeInTheDocument();
    expect(screen.getByText(/Treatment advice withheld by design/i)).toBeInTheDocument();
    expect(screen.queryByText(/resourceType: Task/i)).not.toBeInTheDocument();
  });

  it("shows dry-run Task preview only on baseline", async () => {
    const user = userEvent.setup();
    render(<StewardLab />);
    expect(screen.getByText(/FHIR Task · dry-run preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Not sent to any FHIR endpoint/i)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Invalid tool input/i }));
    expect(screen.getByText(/No Task preview in this scenario/i)).toBeInTheDocument();
  });

  it("opens Source Trace for MCP server with SHA fingerprint", async () => {
    const user = userEvent.setup();
    render(<StewardLab />);
    await user.click(screen.getByRole("button", { name: /Trace MCP server/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/path · mcp-server\/server\.py/i)).toBeInTheDocument();
    expect(
      screen.getByText(/commit · c9a1d6cfd674d72576208863a5f4c694f9130e50/i),
    ).toBeInTheDocument();
  });
});
