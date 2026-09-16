import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MlopsLabPage from "./page";

describe("MlopsLabPage (M6)", () => {
  it("frames the lab as optional and links back to project evidence", () => {
    render(<MlopsLabPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "MLOps Runtime Lab" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Recruiter Work \/ Experience \/ CV paths do not require this lab/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /MLOps Governance Dashboard/i }),
    ).toHaveAttribute("href", "/work/mlops-governance-dashboard");
    expect(screen.getByRole("link", { name: /Project Autopsy/i })).toHaveAttribute(
      "href",
      "/work/mlops-governance-dashboard#project-autopsy",
    );
    expect(screen.getByRole("link", { name: /Project X-Ray/i })).toHaveAttribute(
      "href",
      "/work/mlops-governance-dashboard#project-xray",
    );
    expect(
      screen.getByRole("link", { name: /Reversible Architecture/i }),
    ).toHaveAttribute("href", "/work/mlops-governance-dashboard#reversible-architecture");
    expect(screen.getByRole("button", { name: /SHIFT DATA/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /BREAK THE SYSTEM/i })).toBeInTheDocument();
  });
});
