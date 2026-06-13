import { describe, expect, it } from "vitest";
import { normalizeMoney } from "@/lib/utils/money";

describe("normalizeMoney", () => {
  it("parses Chilean money string", () => {
    expect(normalizeMoney("22.655")).toBe(22655);
  });

  it("parses currency string", () => {
    expect(normalizeMoney("$22.655")).toBe(22655);
  });

  it("keeps integer numbers", () => {
    expect(normalizeMoney(22655)).toBe(22655);
  });

  it("converts mistaken decimal money", () => {
    expect(normalizeMoney(22.655)).toBe(22655);
  });
});
