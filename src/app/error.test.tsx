import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GlobalError from "./global-error";
import RouteError from "./error";
import LabsError from "./labs/error";

const error = Object.assign(new Error("boom"), { digest: "abc123" });

describe("route error boundary (M24)", () => {
  it("keeps the recruiter path reachable when a surface fails", () => {
    render(<RouteError error={error} reset={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /This surface stopped responding/i }),
    ).toBeInTheDocument();
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    for (const label of ["Work", "Experience", "About", "CV", "Contact"]) {
      expect(nav.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("offers retry and states that nothing was stored", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<RouteError error={error} reset={reset} />);
    expect(screen.getByText(/never stored anywhere/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "TRY AGAIN" }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("shows the digest instead of a stack trace", () => {
    render(<RouteError error={error} reset={() => {}} />);
    expect(screen.getByText(/fault digest: abc123/)).toBeInTheDocument();
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
  });

  it("omits the digest line when the runtime did not supply one", () => {
    render(<RouteError error={new Error("boom")} reset={() => {}} />);
    expect(screen.queryByText(/fault digest/i)).not.toBeInTheDocument();
  });
});

describe("labs error boundary (M24)", () => {
  it("frames a failed lab as optional and points back to the evidence", () => {
    render(<LabsError error={error} reset={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /This Runtime Lab stopped responding/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Labs are optional simulations/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse work" })).toHaveAttribute(
      "href",
      "/work",
    );
  });
});

describe("global error boundary (M24)", () => {
  it("renders a self-contained shell with recruiter links and no stack trace", () => {
    // This boundary legitimately renders <html>/<body>; jsdom mounts it inside a div,
    // so React's nesting warning here is a harness artefact, not a defect.
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<GlobalError error={error} reset={() => {}} />);
    warn.mockRestore();
    expect(
      screen.getByRole("heading", { name: /The application failed to render/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the CV" })).toHaveAttribute(
      "href",
      "/cv",
    );
    expect(
      screen.getByText(/Nothing about this session was stored/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
  });
});
