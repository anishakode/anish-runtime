import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MlopsLab } from "./mlops-lab";

describe("MlopsLab (M6+M7)", () => {
  it("shows PORTFOLIO_EXTENSION boundary and Source Trace", () => {
    render(<MlopsLab />);
    expect(screen.getByText(/PORTFOLIO EXTENSION/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Not the exact historical production runtime/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Source Trace/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /drift\.py/i })).toHaveAttribute(
      "href",
      expect.stringContaining("backend/app/utils/drift.py"),
    );
    expect(screen.getByText(/No fabricated Grafana/i)).toBeInTheDocument();
    expect(screen.queryByText(/\buptime\b|\bfps\b/i)).not.toBeInTheDocument();
  });

  it("exposes BREAK, SHIFT, INJECT, RESET and an accessible histogram table", () => {
    render(<MlopsLab />);
    expect(screen.getByRole("button", { name: /BREAK THE SYSTEM/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SHIFT DATA/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /INJECT MISSING/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^RESET$/i })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Reference count/i }),
    ).toBeInTheDocument();
  });

  it("BREAK THE SYSTEM opens Watch Anish Debug and a labeled event trace", async () => {
    const user = userEvent.setup();
    render(<MlopsLab />);
    await user.click(screen.getByRole("button", { name: /BREAK THE SYSTEM/i }));
    expect(screen.getByText(/Monitor · incident/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Watch Anish Debug/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Event trace/i })).toBeInTheDocument();
    expect(screen.getAllByText(/simulated notify/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/code verified/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/No Slack\/email\/webhook left this browser/i),
    ).toBeInTheDocument();
  });

  it("RECOVER returns to healthy baseline after a break", async () => {
    const user = userEvent.setup();
    render(<MlopsLab />);
    await user.click(screen.getByRole("button", { name: /BREAK THE SYSTEM/i }));
    await user.click(screen.getByRole("button", { name: /^RECOVER$/i }));
    expect(screen.getByText(/Monitor · healthy/i)).toBeInTheDocument();
    expect(screen.getByText(/phase recovered/i)).toBeInTheDocument();
    expect(screen.getByText(/action baseline/i)).toBeInTheDocument();
  });

  it("opens Source Trace drawer for PSI with SHA fingerprint", async () => {
    const user = userEvent.setup();
    render(<MlopsLab />);
    expect(screen.getByRole("button", { name: /Trace PSI/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Trace KS/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Trace PSI/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/path · backend\/app\/utils\/drift\.py/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/commit · a2ba6fc45aaece5c3241569271bcca77124da2b4/i),
    ).toBeInTheDocument();
  });
});
