import { describe, expect, it } from "vitest";
import { createSeededRng, sampleNormal } from "./seed";

describe("mlops seed (M5)", () => {
  it("produces identical sequences for the same seed", () => {
    const a = createSeededRng(123);
    const b = createSeededRng(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("diverges for different seeds", () => {
    const a = createSeededRng(1);
    const b = createSeededRng(2);
    expect(a()).not.toBe(b());
  });

  it("sampleNormal is reproducible and rejects negative counts", () => {
    expect(sampleNormal(7, 5)).toEqual(sampleNormal(7, 5));
    expect(sampleNormal(7, 5)).toHaveLength(5);
    expect(() => sampleNormal(1, -1)).toThrow(/count must be >= 0/);
  });
});
