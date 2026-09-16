import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InterviewMyWork } from "./interview-my-work";
import {
  SessionRuntimeProvider,
  useSessionRuntime,
} from "@/components/session/session-runtime-context";
import { getGraph } from "@/lib/evidence/queries";
import { buildInterviewCatalog } from "@/lib/interview/resolve";

vi.mock("next/navigation", () => ({
  usePathname: () => "/interview",
}));

const catalog = buildInterviewCatalog(getGraph());

function Harness() {
  const { recordItem } = useSessionRuntime();
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          recordItem("lab:mlops", "Opened /labs/mlops");
          recordItem("project:proj.steward-ai", "Inspected steward");
        }}
      >
        Seed trail
      </button>
      <InterviewMyWork catalog={catalog} />
    </div>
  );
}

describe("InterviewMyWork (M21)", () => {
  it("shows the entry line and generates nothing before a trail exists", async () => {
    const user = userEvent.setup();
    render(
      <SessionRuntimeProvider>
        <InterviewMyWork catalog={catalog} />
      </SessionRuntimeProvider>,
    );
    expect(screen.getByText(/Let it tell you what to ask me/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Interview question set/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /BUILD QUESTION SET/i }));
    expect(
      screen.getByText(/No canonical evidence was inspected in this session yet/i),
    ).toBeInTheDocument();
  });

  it("builds at most three evidence-bound questions from the trail", async () => {
    const user = userEvent.setup();
    render(
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Seed trail/i }));
    await user.click(screen.getByRole("button", { name: /BUILD QUESTION SET/i }));

    const questions = screen.getByLabelText(/^Questions$/i);
    expect(questions.querySelectorAll(":scope > li").length).toBeLessThanOrEqual(3);
    expect(screen.getAllByLabelText(/Supporting evidence/i).length).toBeGreaterThan(0);
  });

  it("reveals matched triggers and source counts only on WHY THIS QUESTION?", async () => {
    const user = userEvent.setup();
    render(
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Seed trail/i }));
    await user.click(screen.getByRole("button", { name: /BUILD QUESTION SET/i }));

    expect(screen.queryByText(/matched triggers:/i)).not.toBeInTheDocument();
    const whyButtons = screen.getAllByRole("button", { name: /WHY THIS QUESTION\?/i });
    await user.click(whyButtons[0]);
    expect(screen.getByText(/matched triggers:/i)).toBeInTheDocument();
    expect(screen.getByText(/canonical sources:/i)).toBeInTheDocument();
    expect(whyButtons[0]).toHaveAttribute("aria-expanded", "true");
  });

  it("always shows the answer-key boundary and never a score", async () => {
    const user = userEvent.setup();
    render(
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Seed trail/i }));
    await user.click(screen.getByRole("button", { name: /BUILD QUESTION SET/i }));

    const answerKey = screen.getByLabelText(/Answer key/i);
    expect(answerKey).toHaveTextContent("Not generated.");
    expect(answerKey).toHaveTextContent(
      "It will not manufacture Anish's interview answer.",
    );
    expect(screen.queryByText(/fit score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/candidate score/i)).not.toBeInTheDocument();
  });

  it("clears the set on demand", async () => {
    const user = userEvent.setup();
    render(
      <SessionRuntimeProvider>
        <Harness />
      </SessionRuntimeProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Seed trail/i }));
    await user.click(screen.getByRole("button", { name: /BUILD QUESTION SET/i }));
    await user.click(screen.getByRole("button", { name: /Clear set/i }));
    expect(screen.queryByLabelText(/Interview question set/i)).not.toBeInTheDocument();
  });
});
