import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ForkAnish } from "./fork-anish";
import {
  SessionRuntimeProvider,
  useSessionRuntime,
} from "@/components/session/session-runtime-context";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";

vi.mock("next/navigation", () => ({
  usePathname: () => "/fork",
}));

describe("ForkAnish UI (M20)", () => {
  const documents = buildSearchIndex(getGraph());

  it("forks a sample JD into a temporary branch with integrity manifest", async () => {
    const user = userEvent.setup();
    render(<ForkAnish documents={documents} />);
    await user.click(screen.getByRole("button", { name: /Try sample MLOps JD/i }));
    const region = await screen.findByLabelText(/Fork role branch/i);
    expect(within(region).getByText(/anish\/main → role\//i)).toBeInTheDocument();
    expect(
      within(region).getByText(/I won't claim experience I can't demonstrate/i),
    ).toBeInTheDocument();
    expect(within(region).getByText(/Integrity manifest/i)).toBeInTheDocument();
    expect(
      within(region).getByText(/overall fit score: not generated/i),
    ).toBeInTheDocument();
    expect(
      within(region).getByLabelText(/Requirement classifications/i),
    ).toBeInTheDocument();
  });

  it("shows an error when forking an empty JD", async () => {
    const user = userEvent.setup();
    render(<ForkAnish documents={documents} />);
    await user.click(screen.getByRole("button", { name: /^FORK ANISH$/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Paste a job description/i);
  });

  it("puts nothing derived from the pasted JD into the session trace", async () => {
    const user = userEvent.setup();
    let reasons: string[] = [];

    function Probe() {
      reasons = useSessionRuntime().events.map((event) => event.reason);
      return null;
    }

    render(
      <SessionRuntimeProvider>
        <ForkAnish documents={documents} />
        <Probe />
      </SessionRuntimeProvider>,
    );

    // Words a role slug would plausibly be built from, so a regression that
    // echoes the input back into the session shows up here.
    const jd = [
      "Senior Zephyr Platform Engineer at Quaxil Robotics",
      "Own model monitoring and drift detection.",
    ].join("\n");
    await user.type(screen.getByLabelText(/Job description/i), jd);
    await user.click(screen.getByRole("button", { name: /^FORK ANISH$/i }));
    await screen.findByLabelText(/Fork role branch/i);

    expect(reasons.length).toBeGreaterThan(0);
    const recorded = reasons.join(" ").toLowerCase();
    for (const token of ["zephyr", "quaxil", "senior", "robotics", "platform"]) {
      expect(recorded, `"${token}" from the JD reached the session trace`).not.toContain(
        token,
      );
    }
  });
});
