/**
 * Bounded in-memory runtime trace (M22).
 * Safe fields only — raw queries, pasted JD text, prompts, and model reasoning never enter here.
 */

export const RUNTIME_TRACE_LIMIT = 12;

export const RUNTIME_ACTIONS = [
  "SIGNAL_INTERPRET",
  "RECOMPILE_ACCEPTED",
  "FORK_BRANCH",
  "INTERVIEW_SET",
  /** Only recorded after a lab challenge is actually carried through (M23). */
  "CHALLENGE_COMPLETED",
] as const;

export type RuntimeActionKind = (typeof RUNTIME_ACTIONS)[number];

export const RUNTIME_ACTION_LABEL: Record<RuntimeActionKind, string> = {
  SIGNAL_INTERPRET: "Signal interpretation",
  RECOMPILE_ACCEPTED: "Recompile accepted",
  FORK_BRANCH: "Fork Anish branch",
  INTERVIEW_SET: "Interview set built",
  CHALLENGE_COMPLETED: "Challenge completed",
};

export const RUNTIME_STATUSES = ["OK", "GAP", "FALLBACK", "REJECTED"] as const;

export type RuntimeStatus = (typeof RUNTIME_STATUSES)[number];

/** Honest absence vocabulary — never substitute a fabricated number. */
export const NOT_MEASURED = "NOT MEASURED";
export const NOT_COLLECTED = "NOT COLLECTED";
export const UNAVAILABLE = "UNAVAILABLE";

export const NEVER_RECORDED = [
  "Raw Signal queries",
  "Raw pasted job description text",
  "IP address or device fingerprint",
  "Secrets or credentials",
  "Prompts or hidden model reasoning",
] as const;

/**
 * The complete set of fields a trace entry may carry. Anything outside it — a
 * stray `query`, `jobDescription`, `prompt`, or `ip` — is rejected rather than
 * dropped, so an unsafe caller fails loudly instead of quietly succeeding.
 *
 * Hand-written rather than schema-library backed (M24): this validator is the
 * only reason Zod would ship to the browser on every route, and it costs ~24 KB
 * gzip. An explicit allowlist is both smaller and more legible for a privacy
 * boundary. Behaviour is unchanged and pinned by the M22 tests.
 */
export const ALLOWED_TRACE_FIELDS = [
  "action",
  "status",
  "evidenceCount",
  "toolNames",
  "architectureStages",
  "durationMs",
  "note",
] as const;

export const MAX_NOTE_LENGTH = 120;

export type RuntimeTraceInput = {
  action: RuntimeActionKind;
  status: RuntimeStatus;
  /** Null means not measured — the UI says so rather than guessing. */
  evidenceCount?: number | null;
  toolNames?: string[];
  architectureStages?: string[];
  durationMs?: number | null;
  note?: string | null;
};

export type RuntimeTraceEntry = {
  action: RuntimeActionKind;
  status: RuntimeStatus;
  evidenceCount: number | null;
  toolNames: string[];
  architectureStages: string[];
  durationMs: number | null;
  note: string | null;
  id: string;
  label: string;
  at: number;
};

export type TraceValidation =
  { ok: true; entry: RuntimeTraceEntry } | { ok: false; error: string };

function rejected(detail: string): { ok: false; error: string } {
  return { ok: false, error: `Rejected unsafe or malformed trace entry: ${detail}` };
}

function optionalCount(value: unknown, field: string): number | null | string {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return `${field} must be a non-negative integer`;
  }
  return value;
}

function optionalStrings(value: unknown, field: string): string[] | string {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return `${field} must be an array`;
  if (value.some((item) => typeof item !== "string" || item.length === 0)) {
    return `${field} must contain non-empty strings`;
  }
  return value as string[];
}

/** Build a trace entry, rejecting anything the safe-field contract does not allow. */
export function createTraceEntry(
  input: unknown,
  seq: number,
  at: number = Date.now(),
): TraceValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return rejected("expected an object");
  }

  const record = input as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!(ALLOWED_TRACE_FIELDS as readonly string[]).includes(key)) {
      return rejected(`unrecognized field "${key}"`);
    }
  }

  const { action, status, note, durationMs } = record;
  if (!RUNTIME_ACTIONS.includes(action as RuntimeActionKind)) {
    return rejected("unknown action");
  }
  if (!RUNTIME_STATUSES.includes(status as RuntimeStatus)) {
    return rejected("unknown status");
  }

  const evidenceCount = optionalCount(record.evidenceCount, "evidenceCount");
  if (typeof evidenceCount === "string") return rejected(evidenceCount);

  const toolNames = optionalStrings(record.toolNames, "toolNames");
  if (typeof toolNames === "string") return rejected(toolNames);

  const architectureStages = optionalStrings(
    record.architectureStages,
    "architectureStages",
  );
  if (typeof architectureStages === "string") return rejected(architectureStages);

  if (durationMs !== undefined && durationMs !== null) {
    if (typeof durationMs !== "number" || durationMs < 0) {
      return rejected("durationMs must be a non-negative number");
    }
  }

  if (note !== undefined && note !== null) {
    if (typeof note !== "string") return rejected("note must be a string");
    if (note.length > MAX_NOTE_LENGTH) {
      return rejected(`note exceeds ${MAX_NOTE_LENGTH} characters`);
    }
  }

  return {
    ok: true,
    entry: {
      action: action as RuntimeActionKind,
      status: status as RuntimeStatus,
      evidenceCount,
      toolNames,
      architectureStages,
      durationMs: (durationMs as number | undefined) ?? null,
      note: (note as string | undefined) ?? null,
      id: `trace-${seq}`,
      label: RUNTIME_ACTION_LABEL[action as RuntimeActionKind],
      at,
    },
  };
}

/** Append with a hard bound — oldest entries fall off. */
export function appendTraceEntry(
  history: readonly RuntimeTraceEntry[],
  entry: RuntimeTraceEntry,
  limit: number = RUNTIME_TRACE_LIMIT,
): RuntimeTraceEntry[] {
  return [...history, entry].slice(-limit);
}

/** Render a metric or the honest reason it is missing. */
export function formatMetric(
  value: number | null,
  unit: "" | "ms" = "",
  absent: string = NOT_MEASURED,
): string {
  if (value === null) return absent;
  return unit ? `${value}${unit}` : String(value);
}

export function formatToolNames(toolNames: readonly string[]): string {
  return toolNames.length === 0 ? NOT_COLLECTED : toolNames.join(" · ");
}

export function formatStages(stages: readonly string[]): string {
  return stages.length === 0 ? NOT_COLLECTED : stages.join(" → ");
}
