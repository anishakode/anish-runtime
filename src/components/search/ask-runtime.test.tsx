import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AskRuntime } from "./ask-runtime";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";
import type { SignalInterpretation } from "@/lib/signal/types";

describe("AskRuntime (M15–M17)", () => {
  const documents = buildSearchIndex(getGraph());

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a diagnostic search dialog that is not chat-like", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    expect(screen.getByRole("button", { name: /ASK RUNTIME/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: /Deterministic evidence search/i }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/not chat/i)).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("textbox", { name: /message/i }),
    ).not.toBeInTheDocument();
  });

  it("lists ranked hits with honest evidence badges", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    await user.type(screen.getByLabelText(/Search evidence/i), "cardstack");
    const results = screen.getByRole("list", { name: /Deterministic evidence matches/i });
    expect(within(results).getAllByRole("link").length).toBeGreaterThan(0);
    expect(
      within(results).getAllByText(/OWNER CONFIRMED PROFESSIONAL/i).length,
    ).toBeGreaterThan(0);
    expect(within(results).getByText(/exact alias/i)).toBeInTheDocument();
  });

  it("shows semantic relevance when deterministic matches are insufficient", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    await user.type(
      screen.getByLabelText(/Search evidence/i),
      "systems that watch model drift and explain pdf risk signals",
    );
    const semantic = screen.queryByRole("heading", {
      name: /Semantic relevance \(not proof\)/i,
    });
    if (semantic) {
      expect(screen.getByText(/similarity never upgrades proof/i)).toBeInTheDocument();
    } else {
      expect(screen.getByText(/No canonical evidence matched/i)).toBeInTheDocument();
    }
  });

  it("shows a gap notice when nothing matches", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    await user.type(screen.getByLabelText(/Search evidence/i), "zzzznotanentity");
    expect(screen.getByText(/No canonical evidence matched/i)).toBeInTheDocument();
    expect(screen.getByText(/will not invent professional facts/i)).toBeInTheDocument();
  });

  it("keeps LIMITED_EVIDENCE visible for SHAP matches", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    await user.type(screen.getByLabelText(/Search evidence/i), "shap");
    expect(screen.getByText(/LIMITED EVIDENCE/i)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles open with Ctrl+K", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes INTERPRET WITH SIGNAL only after a query is entered", async () => {
    const user = userEvent.setup();
    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    expect(
      screen.queryByRole("button", { name: /INTERPRET WITH SIGNAL/i }),
    ).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/Search evidence/i), "psi");
    expect(
      screen.getByRole("button", { name: /INTERPRET WITH SIGNAL/i }),
    ).toBeInTheDocument();
  });

  it("runs Signal interpretation via API and shows composed UI", async () => {
    const user = userEvent.setup();
    const mock: SignalInterpretation = {
      intent: "cardstack",
      answer: "Tool-backed interpretation for: “cardstack”.",
      evidenceIds: ["experience:exp.cardstack"],
      evidence: [
        {
          id: "experience:exp.cardstack",
          title: "Junior Data & Cloud Engineer",
          kind: "experience",
          evidenceState: "OWNER_CONFIRMED_PROFESSIONAL",
          summary: "Cardstack",
          href: "/experience",
        },
      ],
      gapNotice: null,
      toolTrace: [{ ok: true, tool: "search_evidence", data: { count: 1 } }],
      mode: "tool_orchestrated",
      boundaryNotice:
        "Signal is optional and read-only. Answers are assembled only from allowlisted evidence tools. Evidence states are never upgraded.",
      composeStatus: "composed",
      uiPlan: {
        version: 1,
        layout: "stack",
        blocks: [{ type: "ExperienceCard", experienceId: "exp.cardstack" }],
      },
      composed: {
        layout: "stack",
        blocks: [
          {
            type: "ExperienceCard",
            experienceId: "exp.cardstack",
            company: "Cardstack Consulting Limited",
            title: "Junior Data & Cloud Engineer",
            location: "Remote, UK",
            start: "2024-09",
            end: "2026-02",
            evidenceState: "OWNER_CONFIRMED_PROFESSIONAL",
            href: "/experience",
            technologies: ["Python"],
          },
        ],
      },
      fallbackReason: null,
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mock), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    await user.type(screen.getByLabelText(/Search evidence/i), "cardstack");
    await user.click(screen.getByRole("button", { name: /INTERPRET WITH SIGNAL/i }));

    const section = await screen.findByRole("region", {
      name: /Signal interpretation/i,
    });
    expect(within(section).getByText(/The UI is the AI response/i)).toBeInTheDocument();
    expect(within(section).getByLabelText(/Composed evidence UI/i)).toBeInTheDocument();
    expect(
      within(section).getByText(/OWNER CONFIRMED PROFESSIONAL/i),
    ).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/signal/interpret",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows Signal gap notice when API returns no evidence", async () => {
    const user = userEvent.setup();
    const mock: SignalInterpretation = {
      intent: "zzzz",
      answer:
        "No canonical evidence matched this request. Signal will not invent professional facts.",
      evidenceIds: [],
      evidence: [],
      gapNotice:
        "No canonical evidence matched this request. Signal will not invent professional facts.",
      toolTrace: [{ ok: true, tool: "search_evidence", data: { count: 0, results: [] } }],
      mode: "tool_orchestrated",
      boundaryNotice: "Signal is optional and read-only.",
      composeStatus: "gap",
      uiPlan: {
        version: 1,
        layout: "stack",
        blocks: [{ type: "GapNotice" }],
      },
      composed: {
        layout: "stack",
        blocks: [
          {
            type: "GapNotice",
            message:
              "No canonical evidence matched this request. Signal will not invent professional facts.",
          },
        ],
      },
      fallbackReason: null,
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mock), { status: 200 }),
    );

    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    await user.type(screen.getByLabelText(/Search evidence/i), "zzzz");
    await user.click(screen.getByRole("button", { name: /INTERPRET WITH SIGNAL/i }));

    expect(
      await screen.findByText(/Signal will not invent professional facts/i),
    ).toBeInTheDocument();
  });

  it("shows full fallback notice when composeStatus is fallback", async () => {
    const user = userEvent.setup();
    const mock: SignalInterpretation = {
      intent: "x",
      answer: "Tool-backed interpretation for: “x”.",
      evidenceIds: ["project:proj.mlops-governance"],
      evidence: [
        {
          id: "project:proj.mlops-governance",
          title: "MLOps Governance Dashboard",
          kind: "project",
          evidenceState: "PUBLIC_CODE_VERIFIED",
          summary: "…",
          href: "/work/mlops-governance-dashboard",
        },
      ],
      gapNotice: null,
      toolTrace: [],
      mode: "tool_orchestrated",
      boundaryNotice: "Signal is optional and read-only.",
      composeStatus: "fallback",
      uiPlan: null,
      composed: null,
      fallbackReason: "unknown projectId: bad",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mock), { status: 200 }),
    );

    render(<AskRuntime documents={documents} />);
    await user.click(screen.getByRole("button", { name: /ASK RUNTIME/i }));
    await user.type(screen.getByLabelText(/Search evidence/i), "x");
    await user.click(screen.getByRole("button", { name: /INTERPRET WITH SIGNAL/i }));

    expect(
      await screen.findByText(/no partial generative interface/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Composed evidence UI/i)).not.toBeInTheDocument();
  });
});
