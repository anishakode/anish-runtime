import { describe, expect, it } from "vitest";
import { SIGNAL_MAX_PER_WINDOW } from "@/lib/security";
import { POST } from "./route";

/**
 * The route shares one process-wide limiter, so exhausting it has to happen in its
 * own file — Vitest gives each file a fresh module registry.
 */

const URL_ = "http://localhost/api/signal/interpret";

function post(query: string): Request {
  return new Request(URL_, {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json", Origin: "http://localhost" },
  });
}

describe("Signal rate limit at the route (M24)", () => {
  it("serves the window, then refuses with 429 and a Retry-After", async () => {
    for (let i = 0; i < SIGNAL_MAX_PER_WINDOW; i += 1) {
      const res = await POST(post("shap"));
      expect(res.status, `request ${i + 1} of the window`).toBe(200);
    }

    const limited = await POST(post("shap"));
    expect(limited.status).toBe(429);

    const retryAfter = Number(limited.headers.get("Retry-After"));
    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);

    const body = (await limited.json()) as { error: string };
    expect(body.error).toMatch(/deterministic search is still available/);
    expect(limited.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rate limits before reading the body, so a refusal costs nothing", async () => {
    // The window is already exhausted by the test above; an oversized cross-origin
    // body must still come back as 429 rather than 403 or 413.
    const res = await POST(
      new Request(URL_, {
        method: "POST",
        body: JSON.stringify({ query: "x".repeat(10_000) }),
        headers: { "Content-Type": "text/plain", Origin: "http://evil.test" },
      }),
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("X-Signal-Reject")).toBeNull();
  });
});
