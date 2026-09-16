import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FailuresPage from "./page";

describe("FailuresPage (M14)", () => {
  it("frames the empty museum and keeps recruiter paths ungated", () => {
    render(<FailuresPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Failure Museum" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Recruiter Work \/ Experience \/ About \/ CV \/ Contact paths do not require this museum/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Published exhibits: /i)).toHaveTextContent("0");
    expect(screen.getByText(/NOT DEMONSTRATED/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Artifact-grade publication gate/i }),
    ).toBeInTheDocument();
  });
});
