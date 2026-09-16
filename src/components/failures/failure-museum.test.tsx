import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FailureMuseum } from "./failure-museum";
import { getFailureMuseum } from "@/lib/failures";
import type { FailureExhibit } from "@/lib/failures";

const fixture: FailureExhibit = {
  id: "fail.ui.fixture",
  title: "UI fixture exhibit",
  summary: "Only used to exercise the future renderer.",
  evidenceState: "PUBLIC_CODE_VERIFIED",
  publicationStatus: "published",
  artifacts: [
    {
      id: "art.ui",
      kind: "report",
      title: "Fixture report",
      url: "https://example.com/fixture.pdf",
    },
  ],
  claimedMetrics: [],
};

describe("FailureMuseum (M14)", () => {
  it("renders empty museum with gate requirements and zero published count", () => {
    render(<FailureMuseum museum={getFailureMuseum()} hideMuseumLink />);
    expect(screen.getByText(/NOT DEMONSTRATED/i)).toBeInTheDocument();
    expect(screen.getByText(/Published exhibits: /i)).toHaveTextContent("0");
    expect(screen.getByText(/Empty truthful museum/i)).toBeInTheDocument();
    expect(screen.getByText(/No invented outage theatre/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Artifact-grade publication gate/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/At least one artifact-grade source/i)).toBeInTheDocument();
    expect(screen.queryByText(/severe minority-class failure/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Open dedicated Failure Museum/i }),
    ).not.toBeInTheDocument();
  });

  it("links to /failures when used as an embedded surface", () => {
    render(<FailureMuseum museum={getFailureMuseum()} />);
    expect(
      screen.getByRole("link", { name: /Open dedicated Failure Museum/i }),
    ).toHaveAttribute("href", "/failures");
  });

  it("renders published exhibits when the museum view is non-empty", () => {
    const museum = getFailureMuseum([fixture]);
    render(<FailureMuseum museum={museum} hideMuseumLink />);
    expect(screen.getByText(/Published exhibits: /i)).toHaveTextContent("1");
    expect(
      screen.getByRole("heading", { name: /UI fixture exhibit/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Fixture report/i })).toHaveAttribute(
      "href",
      "https://example.com/fixture.pdf",
    );
    expect(
      screen.queryByRole("heading", { name: /Artifact-grade publication gate/i }),
    ).not.toBeInTheDocument();
  });
});
