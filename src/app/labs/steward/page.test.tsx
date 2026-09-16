import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StewardLabPage from "./page";

describe("StewardLabPage (M12)", () => {
  it("frames the lab as optional and links back to Steward Autopsy", () => {
    render(<StewardLabPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Steward Agent Lab" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Recruiter Work \/ Experience \/ CV paths do not require this lab/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Steward_AI" })).toHaveAttribute(
      "href",
      "/work/steward-ai",
    );
    expect(screen.getByRole("link", { name: /Project Autopsy/i })).toHaveAttribute(
      "href",
      "/work/steward-ai#project-autopsy",
    );
    expect(screen.getByRole("link", { name: /RUN lens/i })).toHaveAttribute(
      "href",
      "/work/steward-ai#steward-lab",
    );
    expect(screen.getByRole("radio", { name: /Baseline/i })).toBeInTheDocument();
  });
});
