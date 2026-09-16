import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecompileBanner } from "./recompile-banner";
import { SessionRuntimeProvider, useSessionRuntime } from "./session-runtime-context";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

function Harness() {
  const { recordItem, consent, activeCategory } = useSessionRuntime();
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          recordItem("lab:mlops", "Opened /labs/mlops");
          recordItem("project:proj.mlops-governance", "Inspected mlops");
          recordItem("project:proj.malware-pdf", "Inspected malware");
          recordItem("lab:malware", "Opened /labs/malware");
          recordItem("project:proj.fraud-detection", "Inspected fraud");
        }}
      >
        Seed ML lean
      </button>
      <p data-testid="consent">{consent}</p>
      <p data-testid="category">{activeCategory ?? "none"}</p>
      <RecompileBanner />
    </div>
  );
}

describe("RecompileBanner (M19)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stays hidden until the heuristic detects a lean", () => {
    render(
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>,
    );
    expect(screen.queryByLabelText(/Signal recompile prompt/i)).not.toBeInTheDocument();
  });

  it("requires explicit RECOMPILE consent and allows RESET", async () => {
    const user = userEvent.setup();
    render(
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Seed ML lean/i }));
    expect(await screen.findByLabelText(/Signal recompile prompt/i)).toBeInTheDocument();
    expect(screen.getByText(/ML ENGINEERING/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^WHY\?$/i }));
    expect(screen.getByText(/Session-only/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^RECOMPILE$/i }));
    expect(screen.getByTestId("consent")).toHaveTextContent("approved");
    expect(screen.getByTestId("category")).toHaveTextContent("ML_ENGINEERING");
    expect(screen.getByLabelText(/Session recompile active/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^RESET$/i }));
    expect(screen.getByTestId("consent")).toHaveTextContent("none");
    expect(screen.getByTestId("category")).toHaveTextContent("none");
  });

  it("NOT NOW dismisses without changing evidence presentation category", async () => {
    const user = userEvent.setup();
    render(
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Seed ML lean/i }));
    await user.click(await screen.findByRole("button", { name: /^NOT NOW$/i }));
    expect(screen.getByTestId("consent")).toHaveTextContent("dismissed");
    expect(screen.getByTestId("category")).toHaveTextContent("none");
    expect(screen.queryByLabelText(/Signal recompile prompt/i)).not.toBeInTheDocument();
  });
});
