import { describe, expect, it } from "vitest";
import { POST } from "./route";

const URL_ = "http://localhost/api/signal/interpret";

function post(
  body: BodyInit,
  headers: Record<string, string> = {},
  init: RequestInit = {},
): Request {
  return new Request(URL_, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
      ...headers,
    },
    ...init,
  });
}

describe("POST /api/signal/interpret (M17 + M24 bounds)", () => {
  it("rejects invalid JSON", async () => {
    const res = await POST(post("not-json"));
    expect(res.status).toBe(400);
    expect(res.headers.get("X-Signal-Mode")).toBe("tool_orchestrated");
    expect(res.headers.get("X-Signal-Reject")).toBe("invalid_json");
  });

  it("rejects oversized queries", async () => {
    const res = await POST(post(JSON.stringify({ query: "x".repeat(501) })));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/500 characters/);
    expect(res.headers.get("X-Signal-Reject")).toBe("query_too_long");
  });

  it("rejects cross-origin and origin-less callers", async () => {
    const cross = await POST(
      post(JSON.stringify({ query: "shap" }), { Origin: "http://evil.test" }),
    );
    expect(cross.status).toBe(403);
    expect(cross.headers.get("X-Signal-Reject")).toBe("cross_origin");

    const bare = new Request(URL_, {
      method: "POST",
      body: JSON.stringify({ query: "shap" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(bare)).status).toBe(403);
  });

  it("rejects non-JSON media types", async () => {
    const res = await POST(post("query=shap", { "Content-Type": "text/plain" }));
    expect(res.status).toBe(415);
    expect(res.headers.get("X-Signal-Reject")).toBe("unsupported_media_type");
  });

  it("rejects bodies over the byte ceiling", async () => {
    const res = await POST(post(JSON.stringify({ query: "x", pad: "y".repeat(5000) })));
    expect(res.status).toBe(413);
    expect(res.headers.get("X-Signal-Reject")).toBe("body_too_large");
  });

  it("rejects non-string and control-character queries", async () => {
    const wrongType = await POST(post(JSON.stringify({ query: { evil: true } })));
    expect(wrongType.status).toBe(400);
    expect(wrongType.headers.get("X-Signal-Reject")).toBe("invalid_query");

    const control = await POST(post(JSON.stringify({ query: "shap\u0000drop" })));
    expect(control.status).toBe(400);
    const body = (await control.json()) as { error: string };
    expect(body.error).toMatch(/control characters/);
  });

  it("answers an empty or whitespace query with a gap, not a guess", async () => {
    for (const query of ["", "   ", "\n\t"]) {
      const res = await POST(post(JSON.stringify({ query })));
      expect(res.status, JSON.stringify(query)).toBe(200);
      const body = (await res.json()) as {
        intent: string;
        gapNotice: string | null;
        evidenceIds: string[];
        toolTrace: unknown[];
      };
      expect(body.intent).toBe("");
      expect(body.gapNotice).toMatch(/will not invent/);
      expect(body.evidenceIds).toEqual([]);
      // No intent means no tool should have run at all.
      expect(body.toolTrace).toEqual([]);
    }
  });

  it("never caches interpretations", async () => {
    const res = await POST(post(JSON.stringify({ query: "shap" })));
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns a tool-orchestrated gap for nonsense", async () => {
    const res = await POST(post(JSON.stringify({ query: "zzzznotanentity" })));
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Evidence-Authority")).toBe("repository-graph");
    const body = (await res.json()) as {
      gapNotice: string | null;
      mode: string;
      evidenceIds: string[];
    };
    expect(body.mode).toBe("tool_orchestrated");
    expect(body.gapNotice).toMatch(/will not invent/);
    expect(body.evidenceIds).toEqual([]);
  });

  it("returns evidence for a known query without inventing states", async () => {
    const res = await POST(post(JSON.stringify({ query: "shap" })));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      evidence: { evidenceState: string }[];
      gapNotice: string | null;
    };
    expect(body.gapNotice).toBeNull();
    expect(body.evidence.some((e) => e.evidenceState === "LIMITED_EVIDENCE")).toBe(true);
  });
});
