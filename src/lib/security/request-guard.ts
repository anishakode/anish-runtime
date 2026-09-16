/**
 * Request bounds for the optional Signal endpoint (M24).
 * Every rejection is a named reason so failures stay explainable rather than generic.
 */

export const MAX_BODY_BYTES = 4096;
export const MAX_QUERY_LENGTH = 500;

export type GuardFailure = {
  ok: false;
  status: number;
  reason:
    | "cross_origin"
    | "unsupported_media_type"
    | "body_too_large"
    | "invalid_json"
    | "invalid_query"
    | "query_too_long";
  message: string;
};

export type GuardSuccess = { ok: true; query: string };
export type GuardResult = GuardSuccess | GuardFailure;

function fail(
  status: number,
  reason: GuardFailure["reason"],
  message: string,
): GuardFailure {
  return { ok: false, status, reason, message };
}

/**
 * Accepts a request only when the browser itself vouches for its origin, via
 * `Sec-Fetch-Site: same-origin` or a matching `Origin`. A caller that sends
 * neither is not a same-origin browser request and is refused.
 */
export function isSameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "same-origin") return true;

  const origin = request.headers.get("origin");
  if (origin === null) return false;

  // Compared against the Host header rather than `request.url`, whose host can be
  // an internal address once the app runs behind a server or proxy.
  const host = request.headers.get("host") ?? safeHost(request.url);
  if (host === null) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

/**
 * Control characters are rejected, not stripped: a query containing them was not
 * typed by a person, and silently rewriting input would hide that.
 */
export function hasControlCharacters(value: string): boolean {
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

/** Reads the body with a hard byte ceiling so a large stream is never buffered whole. */
export async function readBoundedText(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<{ ok: true; text: string } | { ok: false }> {
  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) > maxBytes) return { ok: false };

  const body = request.body;
  if (!body) {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > maxBytes) return { ok: false };
    return { ok: true, text };
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return { ok: false };
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(merged) };
}

export async function guardSignalRequest(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<GuardResult> {
  if (!isSameOrigin(request)) {
    return fail(403, "cross_origin", "same-origin requests only");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return fail(415, "unsupported_media_type", "expected application/json");
  }

  const body = await readBoundedText(request, maxBytes);
  if (!body.ok) {
    return fail(413, "body_too_large", `body exceeds ${maxBytes} bytes`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body.text);
  } catch {
    return fail(400, "invalid_json", "invalid JSON body");
  }

  const query =
    typeof parsed === "object" && parsed !== null
      ? (parsed as { query?: unknown }).query
      : undefined;

  if (typeof query !== "string") {
    return fail(400, "invalid_query", "query must be a string");
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return fail(400, "query_too_long", `query exceeds ${MAX_QUERY_LENGTH} characters`);
  }
  if (hasControlCharacters(query)) {
    return fail(400, "invalid_query", "query contains control characters");
  }

  return { ok: true, query };
}
