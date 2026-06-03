import { describe, expect, it } from "vitest";

import { buildReceiptPrompt } from "@/app/prompts/receipt-prompt-builder";

describe("buildReceiptPrompt", () => {
  it("includes supermarket rules", () => {
    const result = buildReceiptPrompt("SUPERMARKET", ["MEAT"]);

    expect(result).toContain("Supermarket receipt interpretation rules");
  });
});
