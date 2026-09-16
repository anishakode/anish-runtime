import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SourceTraceProvider } from "./source-trace-context";
import { SourceTraceTrigger } from "./source-trace-trigger";
import type { ResolvedSourceTrace } from "@/lib/evidence/source-trace";

const sample: ResolvedSourceTrace = {
  claimLabel: "Population Stability Index (PSI)",
  nodeId: "ev.mlops.psi",
  listAnchorId: "source-trace-heading",
  sources: [
    {
      id: "src.mlops.drift-py",
      title: "Drift / PSI utilities",
      type: "github_file",
      repo: "anishakode/MLOps-Governance-Dashboard",
      path: "backend/app/utils/drift.py",
      commitSha: "a2ba6fc45aaece5c3241569271bcca77124da2b4",
      url: "https://github.com/anishakode/MLOps-Governance-Dashboard/blob/a2ba6fc45aaece5c3241569271bcca77124da2b4/backend/app/utils/drift.py",
      pinned: true,
    },
  ],
};

function Harness() {
  return (
    <SourceTraceProvider>
      <SourceTraceTrigger trace={sample}>Trace PSI</SourceTraceTrigger>
      <h2 id="source-trace-heading">Source Trace</h2>
    </SourceTraceProvider>
  );
}

describe("SourceTrace drawer", () => {
  it("opens authoritative panel with SHA fingerprint and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Trace PSI" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Population Stability Index (PSI)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/commit · a2ba6fc45aaece5c3241569271bcca77124da2b4/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/path · backend\/app\/utils\/drift\.py/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/SHA-pinned/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence panel is authoritative/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Jump to on-page source list/i }),
    ).toHaveAttribute("href", "#source-trace-heading");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes via Close button", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Trace PSI" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("restores focus to the Trace trigger after Close", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Trace PSI" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("does not stack drawers when SourceTraceProvider is nested", async () => {
    const user = userEvent.setup();
    render(
      <SourceTraceProvider>
        <SourceTraceProvider>
          <SourceTraceTrigger trace={sample}>Trace nested</SourceTraceTrigger>
        </SourceTraceProvider>
      </SourceTraceProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Trace nested" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });
});
