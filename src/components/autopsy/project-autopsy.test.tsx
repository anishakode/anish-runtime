import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import { getGraph } from "@/lib/evidence/queries";
import { buildMlopsAutopsyBundle } from "@/lib/autopsy/mlops-bundle";
import { ProjectAutopsy } from "./project-autopsy";

function LabCounter() {
  const [n, setN] = useState(0);
  return (
    <div>
      <p>Lab ticks: {n}</p>
      <button type="button" onClick={() => setN((v) => v + 1)}>
        Tick lab
      </button>
    </div>
  );
}

describe("ProjectAutopsy (M10)", () => {
  const bundle = buildMlopsAutopsyBundle(getGraph());

  function renderAutopsy() {
    return render(
      <ProjectAutopsy
        bundle={bundle}
        runPanel={<LabCounter />}
        xrayPanel={<p>X-Ray panel</p>}
        evidencePanel={<p>Evidence panel</p>}
      />,
    );
  }

  it("defaults to STORY and lists all six lenses", () => {
    renderAutopsy();
    expect(
      screen.getByRole("heading", { name: /Inspection lenses/i }),
    ).toBeInTheDocument();
    for (const label of ["STORY", "RUN", "X-RAY", "DECISIONS", "FAILURES", "EVIDENCE"]) {
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByText(bundle.story.summary)).toBeInTheDocument();
  });

  it("preserves RUN panel state when switching lenses (keep-mounted)", async () => {
    const user = userEvent.setup();
    renderAutopsy();

    await user.click(screen.getByRole("tab", { name: "RUN" }));
    await user.click(screen.getByRole("button", { name: /Tick lab/i }));
    expect(screen.getByText(/Lab ticks: 1/i)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "STORY" }));
    await user.click(screen.getByRole("tab", { name: "RUN" }));
    expect(screen.getByText(/Lab ticks: 1/i)).toBeInTheDocument();
  });

  it("shows empty FAILURES museum without fabricated exhibits", async () => {
    const user = userEvent.setup();
    renderAutopsy();
    await user.click(screen.getByRole("tab", { name: "FAILURES" }));
    expect(screen.getByText(/NOT DEMONSTRATED/i)).toBeInTheDocument();
    expect(screen.getByText(/Empty truthful museum/i)).toBeInTheDocument();
    expect(screen.getByText(/No invented outage theatre/i)).toBeInTheDocument();
    expect(screen.getByText(/Published exhibits: /i)).toHaveTextContent("0");
    expect(
      screen.getByRole("link", { name: /Open dedicated Failure Museum/i }),
    ).toHaveAttribute("href", "/failures");
    expect(
      screen.queryByText(/post-mortem diary of fake outages/i),
    ).not.toBeInTheDocument();
  });

  it("opens Source Trace from a DECISIONS claim", async () => {
    const user = userEvent.setup();
    renderAutopsy();
    await user.click(screen.getByRole("tab", { name: "DECISIONS" }));
    const triggers = screen.getAllByRole("button", { name: /Trace decision sources/i });
    expect(triggers.length).toBeGreaterThan(0);
    await user.click(triggers[0]!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("moves lens selection with Arrow keys (APG tablist)", async () => {
    const user = userEvent.setup();
    renderAutopsy();
    const story = screen.getByRole("tab", { name: "STORY" });
    story.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "RUN" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "RUN" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "EVIDENCE" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("opens X-RAY lens from #project-xray / #reversible-architecture hash", async () => {
    window.location.hash = "#project-xray";
    renderAutopsy();
    expect(
      await screen.findByRole("tab", { name: "X-RAY", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("X-Ray panel")).toBeVisible();
    window.location.hash = "";
  });
});
