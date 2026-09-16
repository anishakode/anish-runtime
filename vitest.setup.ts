import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// next/font is a build-time transform with no runtime implementation, so any test
// that imports the root layout needs a stand-in that returns the same shape.
function fontStub(family: string) {
  return ({ variable = `--font-${family.toLowerCase()}` } = {}) => ({
    className: `font-${family.toLowerCase()}`,
    variable,
    style: { fontFamily: family },
  });
}

vi.mock("next/font/google", () => ({
  Instrument_Sans: fontStub("Instrument_Sans"),
  IBM_Plex_Mono: fontStub("IBM_Plex_Mono"),
}));

afterEach(() => {
  cleanup();
});
