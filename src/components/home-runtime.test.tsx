import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeRuntime, type HomeRuntimeProps } from "./home-runtime";

const baseProps: HomeRuntimeProps = {
  name: "Anish Akode",
  positioning: "AI · ML · Software Engineering",
  proposition: "I build intelligent systems from data to model to production.",
  tagline: "An executable professional identity.",
  stats: {
    nodes: 40,
    projects: 10,
    sources: 23,
    edges: 45,
    byTier: { flagship: 3, supporting: 3, archive: 4 },
  },
  capabilities: ["AI", "ML", "Software Engineering", "MLOps", "observability"],
  flagships: [
    {
      slug: "mlops-governance-dashboard",
      title: "MLOps Governance Dashboard",
      summary: "Monitoring and drift.",
      evidenceState: "PUBLIC_CODE_VERIFIED",
    },
    {
      slug: "steward-ai",
      title: "Steward_AI",
      summary: "Healthcare stewardship prototype.",
      evidenceState: "PUBLIC_CODE_VERIFIED",
    },
    {
      slug: "explainable-pdf-malware-detection",
      title: "Explainable PDF Malware Detection",
      summary: "Explainability study.",
      evidenceState: "PUBLIC_DOCUMENT_VERIFIED",
    },
  ],
};

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("HomeRuntime (M4)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReducedMotion(false);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("keeps recruiter identity and CTAs visible before RUN", () => {
    render(<HomeRuntime {...baseProps} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Anish Akode" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/AI · ML · Software Engineering/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "RUN ANISH" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View work/i })).toHaveAttribute(
      "href",
      "/work",
    );
    expect(screen.getByRole("link", { name: "CV" })).toHaveAttribute("href", "/cv");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("radio", { name: /2 MIN/i })).toBeChecked();
  });

  it("compiles through four steps then settles with graph-backed counts", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomeRuntime {...baseProps} />);

    await user.click(screen.getByRole("button", { name: "RUN ANISH" }));
    expect(screen.getByText("Identity located")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Skip compilation/i })).toHaveFocus();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(650 * 4 + 50);
    });

    expect(screen.getByText(/System ready/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Anish Akode" })).toHaveFocus();
    expect(screen.getByText(/Journey mode · 2 MIN/i)).toBeInTheDocument();
    expect(screen.getByText(/40 nodes/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "MLOps Governance Dashboard" }),
    ).toHaveAttribute("href", "/work/mlops-governance-dashboard");
    const constellation = screen.getByRole("list", {
      name: "Capability constellation",
    });
    expect(within(constellation).getByText("MLOps")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View work" })).toHaveClass("btn-primary");
  });

  it("Skip jumps to ready and moves focus to the ready heading", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomeRuntime {...baseProps} />);
    await user.click(screen.getByRole("button", { name: "RUN ANISH" }));
    await user.click(screen.getByRole("button", { name: /Skip compilation/i }));
    expect(screen.getByText(/System ready/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Anish Akode" })).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: /Skip compilation/i }),
    ).not.toBeInTheDocument();
  });

  it("Escape during compilation settles the runtime", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomeRuntime {...baseProps} />);
    await user.click(screen.getByRole("button", { name: "RUN ANISH" }));
    await user.keyboard("{Escape}");
    expect(screen.getByText(/System ready/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Anish Akode" })).toHaveFocus();
  });

  it("reduced motion settles immediately on RUN", async () => {
    mockReducedMotion(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomeRuntime {...baseProps} />);
    await user.click(screen.getByRole("button", { name: "RUN ANISH" }));
    expect(screen.getByText(/System ready/i)).toBeInTheDocument();
    expect(screen.queryByText("Identity located")).not.toBeInTheDocument();
  });

  it("Reset returns to the readable idle landing and refocuses RUN", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomeRuntime {...baseProps} />);
    await user.click(screen.getByRole("button", { name: "RUN ANISH" }));
    await user.click(screen.getByRole("button", { name: /Skip compilation/i }));
    await user.click(screen.getByRole("button", { name: /Reset runtime/i }));
    expect(screen.getByRole("button", { name: "RUN ANISH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "RUN ANISH" })).toHaveFocus();
    expect(screen.queryByText(/System ready/i)).not.toBeInTheDocument();
  });

  it("20 SEC settle shows one flagship, hides constellation, CV primary", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomeRuntime {...baseProps} />);
    fireEvent.click(screen.getByRole("radio", { name: /20 SEC/i }));
    await user.click(screen.getByRole("button", { name: "RUN ANISH" }));
    await user.click(screen.getByRole("button", { name: /Skip compilation/i }));
    expect(screen.getByText(/Journey mode · 20 SEC/i)).toBeInTheDocument();
    expect(screen.getByText(/Fast path — one flagship/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Capability constellation" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Featured flagship" }).children).toHaveLength(
      1,
    );
    expect(screen.getByRole("link", { name: "CV" })).toHaveClass("btn-primary");
    expect(screen.queryByRole("link", { name: "Steward_AI" })).not.toBeInTheDocument();
  });

  it("EXPLORE settle keeps constellation and browse-all primary", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HomeRuntime {...baseProps} />);
    fireEvent.click(screen.getByRole("radio", { name: /EXPLORE/i }));
    await user.click(screen.getByRole("button", { name: "RUN ANISH" }));
    await user.click(screen.getByRole("button", { name: /Skip compilation/i }));
    expect(screen.getByText(/Journey mode · EXPLORE/i)).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Capability constellation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse all work" })).toHaveClass(
      "btn-primary",
    );
  });
});
