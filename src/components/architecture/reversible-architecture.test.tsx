import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildMlopsArchitectureViews } from "@/lib/architecture/build-views";
import { ReversibleArchitecture } from "./reversible-architecture";

describe("ReversibleArchitecture (M9)", () => {
  const stages = buildMlopsArchitectureViews(getGraph());

  it("labels reconstruction and starts at System Boundary with portfolio honesty", () => {
    render(<ReversibleArchitecture stages={stages} />);
    expect(
      screen.getByText(/Architecture reasoning reconstruction/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/not a fake historical/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "System Boundary" })).toBeInTheDocument();
    expect(screen.getAllByText(/PORTFOLIO EXTENSION/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/does not invent Grafana/i)).not.toBeInTheDocument();
  });

  it("advances with Next and scrubber, and opens Source Trace on detection", async () => {
    const user = userEvent.setup();
    render(<ReversibleArchitecture stages={stages} />);

    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    expect(
      screen.getByRole("heading", { name: "Lifecycle Context" }),
    ).toBeInTheDocument();

    const scrubber = screen.getByRole("slider", { name: /Stage scrubber/i });
    await user.click(scrubber);
    // Jump to Detection (index 3) via Next twice more from Lifecycle (1) → Obs (2) → Det (3)
    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    expect(screen.getByRole("heading", { name: "Detection" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Trace stage sources/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/path · backend\/app\/utils\/drift\.py/i),
    ).toBeInTheDocument();
  });

  it("keeps cumulative map as text and does not invent uptime/fps", () => {
    render(<ReversibleArchitecture stages={stages} />);
    expect(screen.getByText(/Cumulative architecture map/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Not revealed yet/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/\buptime\b|\bfps\b/i)).not.toBeInTheDocument();
  });

  it("Previous stays disabled on first stage", () => {
    render(<ReversibleArchitecture stages={stages} />);
    expect(screen.getByRole("button", { name: /^Previous$/i })).toBeDisabled();
  });
});
