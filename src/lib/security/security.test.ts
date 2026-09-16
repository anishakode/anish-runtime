import { describe, expect, it } from "vitest";
import {
  MAX_BODY_BYTES,
  PERMISSIONS_POLICY,
  buildContentSecurityPolicy,
  createRateLimiter,
  guardSignalRequest,
  hasControlCharacters,
  isSameOrigin,
  readBoundedText,
  securityHeaders,
} from "@/lib/security";

const URL_ = "http://localhost/api/signal/interpret";

function request(body: BodyInit, headers: Record<string, string> = {}): Request {
  return new Request(URL_, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
      ...headers,
    },
  });
}

describe("content security policy (M24)", () => {
  const prod = buildContentSecurityPolicy({ isDev: false });

  it("drops unsafe-eval and websocket connects in production", () => {
    expect(prod).not.toContain("unsafe-eval");
    expect(prod).not.toContain("ws:");
    expect(buildContentSecurityPolicy({ isDev: true })).toContain("'unsafe-eval'");
  });

  it("locks down objects, frames, media, and base URIs", () => {
    expect(prod).toContain("object-src 'none'");
    expect(prod).toContain("frame-src 'none'");
    expect(prod).toContain("media-src 'none'");
    expect(prod).toContain("frame-ancestors 'none'");
    expect(prod).toContain("base-uri 'self'");
    expect(prod).toContain("form-action 'self'");
    expect(prod).toContain("upgrade-insecure-requests");
  });

  it("keeps the app same-origin — no third-party connect or script hosts", () => {
    expect(prod).toContain("connect-src 'self'");
    expect(prod).not.toMatch(/https?:\/\//);
  });
});

describe("security headers (M24)", () => {
  it("emits the full production header set", () => {
    const keys = securityHeaders({ isDev: false, isSecureOrigin: false }).map(
      (h) => h.key,
    );
    for (const key of [
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "X-Permitted-Cross-Domain-Policies",
      "Referrer-Policy",
      "Permissions-Policy",
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Resource-Policy",
    ]) {
      expect(keys).toContain(key);
    }
  });

  it("emits HSTS only for a configured https origin", () => {
    const insecure = securityHeaders({ isDev: true, isSecureOrigin: false });
    expect(insecure.map((h) => h.key)).not.toContain("Strict-Transport-Security");

    const secure = securityHeaders({ isDev: false, isSecureOrigin: true });
    expect(secure.find((h) => h.key === "Strict-Transport-Security")?.value).toMatch(
      /max-age=63072000/,
    );
  });

  it("denies sensor and capture permissions", () => {
    for (const directive of [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
    ]) {
      expect(PERMISSIONS_POLICY).toContain(directive);
    }
  });
});

describe("request guard (M24)", () => {
  it("treats a missing or foreign Origin as cross-origin", () => {
    expect(isSameOrigin(new Request(URL_, { method: "POST" }))).toBe(false);
    expect(isSameOrigin(request("{}", { Origin: "http://evil.test" }))).toBe(false);
    expect(isSameOrigin(request("{}"))).toBe(true);
  });

  it("matches Origin against the Host header, not the internal request URL", () => {
    const behindProxy = new Request("http://127.0.0.1:3000/api/signal/interpret", {
      method: "POST",
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        Host: "anish.example",
        Origin: "https://anish.example",
      },
    });
    expect(isSameOrigin(behindProxy)).toBe(true);

    const spoofed = new Request("http://127.0.0.1:3000/api/signal/interpret", {
      method: "POST",
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        Host: "anish.example",
        Origin: "https://attacker.example",
      },
    });
    expect(isSameOrigin(spoofed)).toBe(false);
  });

  it("accepts the browser's own same-origin declaration", () => {
    const fetchMetadata = new Request(URL_, {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json", "Sec-Fetch-Site": "same-origin" },
    });
    expect(isSameOrigin(fetchMetadata)).toBe(true);

    const crossSite = new Request(URL_, {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json", "Sec-Fetch-Site": "cross-site" },
    });
    expect(isSameOrigin(crossSite)).toBe(false);
  });

  it("refuses a sibling subdomain and an unparseable Origin", () => {
    // same-site covers *.example.com, which is not the same origin.
    const sameSite = new Request(URL_, {
      method: "POST",
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        "Sec-Fetch-Site": "same-site",
        Host: "anish.example",
        Origin: "https://cdn.anish.example",
      },
    });
    expect(isSameOrigin(sameSite)).toBe(false);

    expect(isSameOrigin(request("{}", { Origin: "not-a-url" }))).toBe(false);
    expect(isSameOrigin(request("{}", { Origin: "null" }))).toBe(false);
  });

  it("detects control characters but allows ordinary text", () => {
    expect(hasControlCharacters("drift\u0000")).toBe(true);
    expect(hasControlCharacters("bell\u0007")).toBe(true);
    expect(hasControlCharacters("psi drift on production")).toBe(false);
    expect(hasControlCharacters("line\nbreak\ttab")).toBe(false);
  });

  it("stops reading a body once the ceiling is passed", async () => {
    const big = await readBoundedText(request("y".repeat(MAX_BODY_BYTES + 1)));
    expect(big.ok).toBe(false);

    const small = await readBoundedText(request(JSON.stringify({ query: "shap" })));
    expect(small.ok).toBe(true);
  });

  it("enforces the ceiling on a stream that declares no length", async () => {
    let cancelled = false;
    const chunk = new TextEncoder().encode("z".repeat(1024));
    const streamed = new Request(URL_, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost" },
      body: new ReadableStream<Uint8Array>({
        pull(controller) {
          controller.enqueue(chunk);
        },
        cancel() {
          cancelled = true;
        },
      }),
      // @ts-expect-error duplex is required by undici for a streamed body.
      duplex: "half",
    });

    expect(streamed.headers.get("content-length")).toBeNull();
    const result = await readBoundedText(streamed);
    expect(result.ok).toBe(false);
    // An endless body must be abandoned, not drained.
    expect(cancelled).toBe(true);
  });

  it("reassembles a multi-chunk body under the ceiling", async () => {
    const parts = ['{"query":', '"psi ', 'drift"}'];
    const chunked = new Request(URL_, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost" },
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          for (const part of parts) controller.enqueue(new TextEncoder().encode(part));
          controller.close();
        },
      }),
      // @ts-expect-error duplex is required by undici for a streamed body.
      duplex: "half",
    });

    const result = await readBoundedText(chunked);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(JSON.parse(result.text)).toEqual({ query: "psi drift" });
  });

  it("names the reason for every rejection", async () => {
    const cases: [Request, string][] = [
      [
        request(JSON.stringify({ query: "x" }), { Origin: "http://evil.test" }),
        "cross_origin",
      ],
      [request("x=1", { "Content-Type": "text/plain" }), "unsupported_media_type"],
      [request("z".repeat(MAX_BODY_BYTES + 1)), "body_too_large"],
      [request("{oops"), "invalid_json"],
      [request(JSON.stringify({ query: 42 })), "invalid_query"],
      [request(JSON.stringify({ q: "shap" })), "invalid_query"],
      [request(JSON.stringify({ query: null })), "invalid_query"],
      [request(JSON.stringify(["shap"])), "invalid_query"],
      [request("null"), "invalid_query"],
      [request(JSON.stringify({ query: "x".repeat(501) })), "query_too_long"],
      [request(JSON.stringify({ query: "ok\u0001" })), "invalid_query"],
    ];
    for (const [req, reason] of cases) {
      const result = await guardSignalRequest(req);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe(reason);
    }
  });

  it("passes a well-formed same-origin query through untouched", async () => {
    const result = await guardSignalRequest(
      request(JSON.stringify({ query: " psi drift " })),
    );
    expect(result).toEqual({ ok: true, query: " psi drift " });
  });
});

describe("rate limiter (M24)", () => {
  it("allows up to the cap then refuses within the window", () => {
    const limiter = createRateLimiter(3, 60_000);
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(10).allowed).toBe(true);
    expect(limiter.check(20).remaining).toBe(0);
    const blocked = limiter.check(30);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("reopens on the next window", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(500).allowed).toBe(false);
    expect(limiter.check(1001).allowed).toBe(true);
  });

  it("derives no visitor key — the window is shared by construction", () => {
    const limiter = createRateLimiter(1, 1000);
    // Two different callers cannot be distinguished; the second is refused.
    expect(limiter.check(0).allowed).toBe(true);
    expect(limiter.check(1).allowed).toBe(false);
  });
});
