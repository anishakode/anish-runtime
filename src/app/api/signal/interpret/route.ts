import { getGraph } from "@/lib/evidence/queries";
import { buildSearchIndex } from "@/lib/search";
import { guardSignalRequest, signalRateLimiter } from "@/lib/security";
import { interpretWithSignal } from "@/lib/signal/orchestrate";

export const dynamic = "force-dynamic";

const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Signal-Mode": "tool_orchestrated",
  "X-Evidence-Authority": "repository-graph",
};

/**
 * POST /api/signal/interpret — explicit INTERPRET WITH SIGNAL entry (M17).
 * Tool-orchestrated only; no freeform LLM. Request-local tool session.
 * M24 bounds: same-origin, JSON only, byte ceiling, control-character rejection,
 * and a shared rate limit. Every rejection degrades to deterministic search.
 */
export async function POST(request: Request) {
  const limit = signalRateLimiter.check();
  if (!limit.allowed) {
    return Response.json(
      { error: "Signal is rate limited — deterministic search is still available." },
      {
        status: 429,
        headers: { ...BASE_HEADERS, "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const guard = await guardSignalRequest(request);
  if (!guard.ok) {
    return Response.json(
      { error: guard.message },
      {
        status: guard.status,
        headers: { ...BASE_HEADERS, "X-Signal-Reject": guard.reason },
      },
    );
  }

  const documents = buildSearchIndex(getGraph());
  const interpretation = interpretWithSignal(guard.query, documents);

  return Response.json(interpretation, { headers: BASE_HEADERS });
}
