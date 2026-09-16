import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ForkAnish } from "./fork-anish";
import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";

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
});
