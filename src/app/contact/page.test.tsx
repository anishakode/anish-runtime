import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContactPage from "./page";

describe("ContactPage — identity hygiene", () => {
  it("links only canonical graph contact channels", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();

    const email = screen.getByRole("link", { name: "anishakode3101@gmail.com" });
    expect(email).toHaveAttribute("href", "mailto:anishakode3101@gmail.com");

    const github = screen.getByRole("link", { name: "github.com/anishakode" });
    expect(github).toHaveAttribute("href", "https://github.com/anishakode");

    const linkedin = screen.getByRole("link", { name: "linkedin.com/in/anishakode" });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/anishakode");

    expect(screen.queryByText(/anishakode2002@gmail.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sricons/i)).not.toBeInTheDocument();
  });
});
