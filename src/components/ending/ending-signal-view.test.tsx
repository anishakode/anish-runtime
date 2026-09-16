import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EndingSignalView } from "./ending-signal-view";
import {
  RuntimeTraceProvider,
  useRuntimeTrace,
} from "@/components/runtime-trace/runtime-trace-context";
import {
  SessionRuntimeProvider,
  useSessionRuntime,
} from "@/components/session/session-runtime-context";
import { buildJourneyCatalog } from "@/lib/ending/catalog";
import { getGraph } from "@/lib/evidence/queries";

vi.mock("next/navigation", () => ({
  usePathname: () => "/ending",
}));

const catalog = buildJourneyCatalog(getGraph());
const contact = {
  email: "anish@example.com",
  github: "https://github.com/example",
  linkedin: "https://linkedin.com/in/example",
};

function Harness() {
  const { recordItem } = useSessionRuntime();
  const { record } = useRuntimeTrace();
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          recordItem("lab:mlops", "Opened /labs/mlops");
          recordItem("project:proj.mlops-governance", "Inspected MLOps evidence");
        }}
      >
        Seed trail
      </button>
      <button
        type="button"
        onClick={() =>
          record({
            action: "CHALLENGE_COMPLETED",
            status: "OK",
            note: "MLOps controlled incident recovered to healthy baseline",
          })
        }
      >
        Seed challenge
      </button>
      <EndingSignalView catalog={catalog} contact={contact} />
    </div>
  );
}

function renderHarness() {
  return render(
    <RuntimeTraceProvider>
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>
    </RuntimeTraceProvider>,
  );
}

describe("EndingSignalView (M23)", () => {
  it("keeps an inactive session shallow and says so", () => {
    render(
      <RuntimeTraceProvider>
        <SessionRuntimeProvider>
          <EndingSignalView catalog={catalog} contact={contact} />
        </SessionRuntimeProvider>
      </RuntimeTraceProvider>,
    );
    expect(screen.getByText("YOUR PATH THROUGH ANISH")).toBeInTheDocument();
    expect(screen.getByText("SHALLOW")).toBeInTheDocument();
    expect(
      screen.getByText(/No canonical evidence was opened in this session/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Journey nodes/i)).not.toBeInTheDocument();
  });

  it("always states that the signal describes the session, not the person", () => {
    renderHarness();
    expect(screen.getByText("This describes this session, not you.")).toBeInTheDocument();
  });

  it("replays the canonical route in visit order", async () => {
    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByRole("button", { name: /Seed trail/i }));
    const nodes = within(screen.getByLabelText(/Journey nodes/i)).getAllByRole(
      "listitem",
    );
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toHaveTextContent("MLOps Runtime Lab");
    expect(nodes[1]).toHaveTextContent("MLOps Governance Dashboard");
  });

  it("lists a completed challenge separately from runtime actions", async () => {
    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByRole("button", { name: /Seed challenge/i }));
    const challenges = screen.getByLabelText(/Completed challenges/i);
    expect(
      within(challenges).getByText(/MLOps controlled incident recovered/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Runtime actions$/i)).not.toBeInTheDocument();
  });

  it("explains provenance and exclusions behind WHY THIS SIGNAL?", async () => {
    const user = userEvent.setup();
    renderHarness();
    expect(screen.queryByText(/Employer identity/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /WHY THIS SIGNAL\?/i }));
    expect(screen.getByText(/Employer identity/i)).toBeInTheDocument();
    expect(screen.getByText(/Raw Signal queries/i)).toBeInTheDocument();
    expect(screen.getByText(/Persistent behaviour profiles/i)).toBeInTheDocument();
  });

  it("publishes the journey integrity manifest with zeroed tracking", () => {
    renderHarness();
    const manifest = screen.getByLabelText(/Journey integrity manifest/i);
    expect(manifest).toHaveTextContent("external tracking used: 0");
    expect(manifest).toHaveTextContent("persistent profiles created: 0");
    expect(manifest).toHaveTextContent("inferred personal traits: 0");
    expect(manifest).toHaveTextContent("fabricated interactions: 0");
  });

  it("closes on the human with conventional contact actions", () => {
    renderHarness();
    expect(
      screen.getByText("There's one thing left you can't test here."),
    ).toBeInTheDocument();
    expect(screen.getByText("Working with me.")).toBeInTheDocument();
    expect(
      screen.getByText("The last unresolved node is the human."),
    ).toBeInTheDocument();
    const actions = screen.getByLabelText(/Contact actions/i);
    expect(within(actions).getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
    expect(within(actions).getByRole("link", { name: "CV" })).toHaveAttribute(
      "href",
      "/cv",
    );
    expect(within(actions).getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      contact.linkedin,
    );
    expect(within(actions).getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      contact.github,
    );
  });
});
