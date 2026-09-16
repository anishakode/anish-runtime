import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import { buildMlopsXrayLayers } from "@/lib/xray/build-views";
import { ProjectXray } from "./project-xray";

describe("ProjectXray (M11)", () => {
  const layers = buildMlopsXrayLayers(getGraph());

  it("lists layers and selects a component with related + Trace", async () => {
    const user = userEvent.setup();
    render(<ProjectXray layers={layers} />);

    expect(screen.getByText(/Project X-Ray/i)).toBeInTheDocument();
    expect(screen.getByText(/not invented Redis\/MLflow/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Detection" })).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Drift monitoring \(PSI utilities\)/i }),
    );
    expect(screen.getByLabelText(/Selected component/i)).toHaveTextContent(/PSI/i);
    expect(screen.getByText(/Related ·/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Trace component sources/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/path · backend\/app\/utils\/drift\.py/i),
    ).toBeInTheDocument();
  });

  it("isolates a layer and dims others in the semantic list", async () => {
    const user = userEvent.setup();
    render(<ProjectXray layers={layers} />);

    await user.click(screen.getByRole("button", { name: /Isolate Detection/i }));
    const detection = screen.getByRole("heading", { name: "Detection" }).closest("li");
    // Dimmed layers stay in the a11y tree (opacity PE only — no aria-hidden).
    const boundary = screen.getByRole("heading", { name: "Boundary" }).closest("li");
    expect(detection).not.toHaveClass("xray-layer--dimmed");
    expect(boundary).toHaveClass("xray-layer--dimmed");
    expect(boundary).not.toHaveAttribute("aria-hidden");

    await user.click(screen.getByRole("button", { name: /Show all layers/i }));
    expect(
      screen.getByRole("heading", { name: "Boundary" }).closest("li"),
    ).not.toHaveClass("xray-layer--dimmed");
  });
});
