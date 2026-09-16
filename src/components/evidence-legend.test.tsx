import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EvidenceLegend,
  LEGEND_STATES,
  legendCoversAllEvidenceStates,
} from "./evidence-legend";
import { EvidenceBadge } from "./evidence-badge";
import { EvidenceStateSchema } from "@/lib/evidence/schema";
import { evidenceStateLabel } from "@/lib/evidence/queries";

describe("EvidenceBadge + legend (M3)", () => {
  it("keeps textual state labels (colour is never the only cue)", () => {
    render(<EvidenceBadge state="PORTFOLIO_EXTENSION" />);
    const badge = screen.getByText(/PORTFOLIO EXTENSION/i);
    expect(badge).toHaveAttribute("data-evidence-state", "PORTFOLIO_EXTENSION");
    expect(badge.className).toContain("evidence-badge");
  });

  it("covers every EvidenceState in the legend data", () => {
    expect(legendCoversAllEvidenceStates()).toBe(true);
    expect(LEGEND_STATES).toHaveLength(EvidenceStateSchema.options.length);
  });

  it("renders every evidence state label in the legend UI", () => {
    render(<EvidenceLegend />);
    expect(screen.getByText(/Evidence state legend/i)).toBeInTheDocument();
    for (const state of EvidenceStateSchema.options) {
      expect(screen.getByText(evidenceStateLabel(state)), state).toBeInTheDocument();
    }
  });
});
