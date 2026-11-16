import { describe, expect, it } from "vitest";

import { DEFAULT_POLL_INTERVAL_MS } from "@/workers/extraction-policy";
import { readPositiveIntEnv } from "@/workers/worker-config";

describe("WORKER_POLL_INTERVAL_MS", () => {
  it("defaults to 5000 when the variable is missing or blank", () => {
    expect(readPositiveIntEnv("WORKER_POLL_INTERVAL_MS", DEFAULT_POLL_INTERVAL_MS, {})).toBe(5000);
    expect(
      readPositiveIntEnv("WORKER_POLL_INTERVAL_MS", DEFAULT_POLL_INTERVAL_MS, {
        WORKER_POLL_INTERVAL_MS: "   ",
      }),
    ).toBe(5000);
  });

  it("reads a positive integer", () => {
    expect(
      readPositiveIntEnv("WORKER_POLL_INTERVAL_MS", DEFAULT_POLL_INTERVAL_MS, {
        WORKER_POLL_INTERVAL_MS: "7500",
      }),
    ).toBe(7500);
  });

  it.each(["0", "-1", "1.5", "abc", "7500ms"])(
    "rejects invalid value %s before it can be used",
    (raw) => {
      expect(() =>
        readPositiveIntEnv("WORKER_POLL_INTERVAL_MS", DEFAULT_POLL_INTERVAL_MS, {
          WORKER_POLL_INTERVAL_MS: raw,
        }),
      ).toThrow("WORKER_POLL_INTERVAL_MS must be a positive integer");
    },
  );
});
