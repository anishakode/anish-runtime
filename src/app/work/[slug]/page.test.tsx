import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ProjectPage from "./page";

describe("ProjectPage — weak evidence honesty", () => {
  it("surfaces PORTFOLIO EXTENSION via Autopsy RUN / story path on MLOps", async () => {
    const user = userEvent.setup();
    const ui = await ProjectPage({
      params: Promise.resolve({ slug: "mlops-governance-dashboard" }),
    });
    render(ui);
    expect(
      screen.getByRole("heading", { level: 1, name: "MLOps Governance Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Inspection lenses/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "RUN" }));
    expect(screen.getAllByText(/PORTFOLIO EXTENSION/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /Open dedicated MLOps Runtime Lab/i }),
    ).toHaveAttribute("href", "/labs/mlops");
  });

  it("surfaces LIMITED EVIDENCE on the malware SHAP path", async () => {
    const user = userEvent.setup();
    const ui = await ProjectPage({
      params: Promise.resolve({ slug: "explainable-pdf-malware-detection" }),
    });
    render(ui);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Explainable PDF Malware Detection",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "RUN" }));
    expect(screen.getAllByText(/LIMITED EVIDENCE/i).length).toBeGreaterThan(0);
  });

  it("exposes Source Trace triggers on the EVIDENCE lens", async () => {
    const user = userEvent.setup();
    const ui = await ProjectPage({
      params: Promise.resolve({ slug: "mlops-governance-dashboard" }),
    });
    render(ui);
    await user.click(screen.getByRole("tab", { name: "EVIDENCE" }));
    const triggers = screen.getAllByRole("button", { name: /Trace source/i });
    expect(triggers.length).toBeGreaterThan(0);
  });

  it("surfaces Project X-Ray and Reversible Architecture on the X-RAY lens", async () => {
    const user = userEvent.setup();
    const ui = await ProjectPage({
      params: Promise.resolve({ slug: "mlops-governance-dashboard" }),
    });
    render(ui);
    await user.click(screen.getByRole("tab", { name: "X-RAY" }));
    expect(screen.getAllByText(/Project X-Ray/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Responsibility layers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Isolate Detection/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Architecture reasoning reconstruction/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Reversible Architecture" }),
    ).toBeInTheDocument();
  });

  it("surfaces Malware Autopsy RUN with Explainability Lab honesty", async () => {
    const user = userEvent.setup();
    const ui = await ProjectPage({
      params: Promise.resolve({ slug: "explainable-pdf-malware-detection" }),
    });
    render(ui);
    expect(
      screen.getByRole("heading", { name: /Inspection lenses/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "RUN" }));
    expect(screen.getAllByText(/PORTFOLIO EXTENSION/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/No malware execution/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", {
        name: /Open dedicated PDF Malware Explainability Lab/i,
      }),
    ).toHaveAttribute("href", "/labs/malware");
  });

  it("surfaces Steward Autopsy RUN with Agent Lab honesty", async () => {
    const user = userEvent.setup();
    const ui = await ProjectPage({
      params: Promise.resolve({ slug: "steward-ai" }),
    });
    render(ui);
    expect(
      screen.getByRole("heading", { level: 1, name: "Steward_AI" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Inspection lenses/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "RUN" }));
    expect(screen.getAllByText(/PORTFOLIO EXTENSION/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Not medical advice/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /Open dedicated Steward Agent Lab/i }),
    ).toHaveAttribute("href", "/labs/steward");
  });
});
