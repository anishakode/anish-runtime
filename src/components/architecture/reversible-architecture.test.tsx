import { fireEvent, render, screen } from "@testing-library/react";
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

  it("advances with Next and opens Source Trace on detection", async () => {
    const user = userEvent.setup();
    render(<ReversibleArchitecture stages={stages} />);

    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    expect(
      screen.getByRole("heading", { name: "Lifecycle Context" }),
    ).toBeInTheDocument();

    // Lifecycle (1) → Observability (2) → Detection (3)
    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    await user.click(screen.getByRole("button", { name: /^Next$/i }));
    expect(screen.getByRole("heading", { name: "Detection" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Trace stage sources/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/path · backend\/app\/utils\/drift\.py/i),
    ).toBeInTheDocument();
  });

  it("jumps stages with the scrubber", async () => {
    render(<ReversibleArchitecture stages={stages} />);
    const scrubber = screen.getByRole("slider", { name: /Stage scrubber/i });

    // `user.click` on a range input moves nothing, so the old test asserted a
    // change that Next had actually produced. Fire the change the browser would.
    fireEvent.change(scrubber, { target: { value: "4" } });
    expect(screen.getByRole("heading", { name: "Governance Loop" })).toBeInTheDocument();
    expect(scrubber).toHaveValue("4");

    // And back down, so it is not one-directional.
    fireEvent.change(scrubber, { target: { value: "1" } });
    expect(
      screen.getByRole("heading", { name: "Lifecycle Context" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Previous$/i })).toBeEnabled();
  });

  it("only lets the cumulative map jump to stages already revealed", async () => {
    const user = userEvent.setup();
    render(<ReversibleArchitecture stages={stages} />);

    // Nothing past the first stage is reachable yet — the map cannot be used to
    // skip the reasoning it is supposed to accumulate.
    expect(screen.getByRole("button", { name: /5\. Governance Loop/i })).toBeDisabled();

    fireEvent.change(screen.getByRole("slider", { name: /Stage scrubber/i }), {
      target: { value: "4" },
    });
    const first = screen.getByRole("button", { name: /1\. System Boundary/i });
    expect(first).toBeEnabled();

    await user.click(first);
    expect(screen.getByRole("heading", { name: "System Boundary" })).toBeInTheDocument();
    expect(first).toHaveAttribute("aria-current", "step");
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
