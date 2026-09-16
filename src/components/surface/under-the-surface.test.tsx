import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UnderTheSurface } from "./under-the-surface";
import {
  RuntimeTraceProvider,
  useRuntimeTrace,
} from "@/components/runtime-trace/runtime-trace-context";

function Harness() {
  const { record } = useRuntimeTrace();
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          record({
            action: "SIGNAL_INTERPRET",
            status: "OK",
            evidenceCount: 4,
            toolNames: ["search_evidence", "fetch_project"],
            architectureStages: ["INTERFACE", "ORCHESTRATION"],
            durationMs: 37,
          })
        }
      >
        Record signal
      </button>
      <button
        type="button"
        onClick={() =>
          record({
            action: "RECOMPILE_ACCEPTED",
            status: "OK",
          })
        }
      >
        Record recompile
      </button>
      <button
        type="button"
        onClick={() =>
          // @ts-expect-error — deliberately unsafe payload
          record({ action: "SIGNAL_INTERPRET", status: "OK", query: "raw text" })
        }
      >
        Record unsafe
      </button>
      <UnderTheSurface />
    </div>
  );
}

describe("UnderTheSurface (M22)", () => {
  it("shows the entry line and all five layers", () => {
    render(
      <RuntimeTraceProvider>
        <UnderTheSurface />
      </RuntimeTraceProvider>,
    );
    expect(
      screen.getByText(/Now inspect the system that showed it to you/i),
    ).toBeInTheDocument();
    const layers = within(screen.getByLabelText("Architecture layers"));
    for (const layer of ["INTERFACE", "ORCHESTRATION", "TRUTH", "SESSION", "RUNTIME"]) {
      expect(
        layers.getByRole("button", { name: new RegExp(`^${layer}`) }),
      ).toBeInTheDocument();
    }
  });

  it("labels labs as portfolio simulation, never real runtime", async () => {
    const user = userEvent.setup();
    render(
      <RuntimeTraceProvider>
        <UnderTheSurface />
      </RuntimeTraceProvider>,
    );
    await user.click(screen.getByRole("button", { name: /RUNTIME.*Labs, APIs/i }));
    const list = screen.getByLabelText("RUNTIME subsystems");
    const lab = within(list).getByText("MLOps Runtime Lab").closest("li") as HTMLElement;
    expect(within(lab).getByText("PORTFOLIO SIMULATION")).toBeInTheDocument();
    expect(within(lab).queryByText("REAL RUNTIME")).not.toBeInTheDocument();
  });

  it("filters subsystems by reality label", async () => {
    const user = userEvent.setup();
    render(
      <RuntimeTraceProvider>
        <UnderTheSurface />
      </RuntimeTraceProvider>,
    );
    await user.click(screen.getByRole("button", { name: "OPTIONAL PROVIDER" }));
    expect(
      screen.getByText(/No OPTIONAL PROVIDER subsystem in this layer/i),
    ).toBeInTheDocument();
  });

  it("starts with an empty trace and records safe fields only", async () => {
    const user = userEvent.setup();
    render(
      <RuntimeTraceProvider>
        <Harness />
      </RuntimeTraceProvider>,
    );
    expect(
      screen.getByText(/No runtime actions in this session yet/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Record signal/i }));
    const entries = screen.getByLabelText(/Runtime trace entries/i);
    expect(within(entries).getByText(/Signal interpretation/i)).toBeInTheDocument();
    expect(within(entries).getByText(/evidence count: 4/i)).toBeInTheDocument();
    expect(within(entries).getByText(/duration: 37ms/i)).toBeInTheDocument();
    expect(
      within(entries).getByText(/tools: search_evidence · fetch_project/i),
    ).toBeInTheDocument();
  });

  it("shows NOT MEASURED and NOT COLLECTED instead of fabricated numbers", async () => {
    const user = userEvent.setup();
    render(
      <RuntimeTraceProvider>
        <Harness />
      </RuntimeTraceProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Record recompile/i }));
    const entries = screen.getByLabelText(/Runtime trace entries/i);
    expect(
      within(entries).getByText(/evidence count: NOT MEASURED/i),
    ).toBeInTheDocument();
    expect(within(entries).getByText(/duration: NOT MEASURED/i)).toBeInTheDocument();
    expect(within(entries).getByText(/tools: NOT COLLECTED/i)).toBeInTheDocument();
  });

  it("counts rejected unsafe entries without rendering them", async () => {
    const user = userEvent.setup();
    render(
      <RuntimeTraceProvider>
        <Harness />
      </RuntimeTraceProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Record unsafe/i }));
    expect(screen.getByText(/rejected unsafe entries: 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/raw text/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/No runtime actions in this session yet/i),
    ).toBeInTheDocument();
  });

  it("clears the trace on demand", async () => {
    const user = userEvent.setup();
    render(
      <RuntimeTraceProvider>
        <Harness />
      </RuntimeTraceProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Record signal/i }));
    await user.click(screen.getByRole("button", { name: /CLEAR TRACE/i }));
    expect(
      screen.getByText(/No runtime actions in this session yet/i),
    ).toBeInTheDocument();
  });

  it("declares what is never recorded", () => {
    render(
      <RuntimeTraceProvider>
        <UnderTheSurface />
      </RuntimeTraceProvider>,
    );
    const section = screen.getByLabelText(/Never recorded/i);
    expect(within(section).getByText(/Raw Signal queries/i)).toBeInTheDocument();
    expect(
      within(section).getByText(/Raw pasted job description text/i),
    ).toBeInTheDocument();
    expect(
      within(section).getByText(/IP address or device fingerprint/i),
    ).toBeInTheDocument();
  });
});
