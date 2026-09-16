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

  it("records no session item at all, and nothing derived from the JD", async () => {
    const user = userEvent.setup();
    let events: { itemId: string; reason: string }[] = [];

    function Probe() {
      events = useSessionRuntime().events.map((event) => ({
        itemId: event.itemId,
        reason: event.reason,
      }));
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

    // Forking is not a visit to a route and reveals no topic interest.
    // Recording one would inflate the M19 Recompile heuristic and render on
    // /ending as a node the visitor never opened, on the page that publishes
    // "fabricated interactions: 0".
    expect(events).toEqual([]);

    const recorded = events
      .map((e) => `${e.itemId} ${e.reason}`)
      .join(" ")
      .toLowerCase();
    for (const token of ["zephyr", "quaxil", "senior", "robotics", "platform"]) {
      expect(recorded, `"${token}" from the JD reached the session trace`).not.toContain(
        token,
      );
    }
  });

  it("never manufactures a visit to Experience or CV", async () => {
    const user = userEvent.setup();
    let itemIds: string[] = [];

    function Probe() {
      itemIds = useSessionRuntime().events.map((event) => event.itemId);
      return null;
    }

    render(
      <SessionRuntimeProvider>
        <ForkAnish documents={documents} />
        <Probe />
      </SessionRuntimeProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Try sample MLOps JD/i }));
    await user.click(screen.getByRole("button", { name: /^FORK ANISH$/i }));
    await screen.findByLabelText(/Fork role branch/i);

    expect(itemIds).not.toContain("route:experience");
    expect(itemIds).not.toContain("route:cv");
  });
});
