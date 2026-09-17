import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CvPage from "./page";

/** Walk up from an element to see whether printing would hide it. */
function hiddenInPrint(element: HTMLElement | null): boolean {
  for (let node = element; node; node = node.parentElement) {
    if (node.classList?.contains("no-print")) return true;
  }
  return false;
}

describe("CvPage", () => {
  it("prints graph-backed identity, experience metrics, and selected projects", () => {
    render(<CvPage />);
    expect(screen.getByRole("heading", { name: "CV" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Anish Akode" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Print \/ Save as PDF/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Junior Data & Cloud Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/30% fewer API integration defects/i)).toBeInTheDocument();
    expect(screen.getByText(/MLOps Governance Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/MSc Data Science/i)).toBeInTheDocument();
    expect(screen.queryByText(/anishakode2002@gmail.com/i)).not.toBeInTheDocument();
  });

  it("prints the attribution for self-reported impact figures", () => {
    // The PDF is the one artifact that leaves this site. "The site carries the
    // qualifiers" stops being true the moment the file is forwarded, so the
    // sourcing has to survive printing alongside the numbers.
    render(<CvPage />);

    const note = screen.getByText(/Professional impact confirmed by Anish/i);
    expect(note).toBeInTheDocument();
    expect(hiddenInPrint(note), "attribution is hidden from the PDF").toBe(false);
    expect(note.textContent).toMatch(/not public/i);
  });

  it("prints the evidence badge beside the role those figures belong to", () => {
    render(<CvPage />);

    const badge = screen.getByText(/OWNER CONFIRMED PROFESSIONAL/i);
    expect(hiddenInPrint(badge), "evidence badge is hidden from the PDF").toBe(false);
  });

  it("hides only the print control itself from the printed page", () => {
    // A print button inside a PDF is noise; an evidence label is not. This is
    // the line the earlier version got wrong.
    render(<CvPage />);

    expect(
      hiddenInPrint(screen.getByRole("button", { name: /Print \/ Save as PDF/i })),
    ).toBe(true);

    for (const metric of [
      /30% fewer API integration defects/i,
      /Zero audit failures across six release cycles/i,
      /40% faster incident investigation/i,
    ]) {
      const figure = screen.getByText(metric);
      expect(hiddenInPrint(figure), `${figure.textContent} is hidden in print`).toBe(
        false,
      );
    }
  });

  it("never prints a bare impact figure with no qualifier anywhere on the page", () => {
    // The failure mode was not a missing sentence, it was a surviving number
    // whose qualifier did not survive with it.
    const { container } = render(<CvPage />);

    for (const node of container.querySelectorAll<HTMLElement>(".no-print")) {
      expect(
        node.textContent ?? "",
        "an evidence label is inside a no-print block",
      ).not.toMatch(/OWNER CONFIRMED|PUBLIC CODE|PUBLIC DOCUMENT|RESUME DOCUMENTED/i);
    }
  });
});
