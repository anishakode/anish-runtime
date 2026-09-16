/**
 * Monitoring state machine for the deterministic MLOps core (M5).
 * UI incident choreography is M6/M7 — this is transition logic only.
 */

export type MonitorState =
  "healthy" | "watching" | "drift_detected" | "incident" | "recovering";

export type MonitorEvent =
  | { type: "observe_ok" }
  | { type: "observe_drift"; severity: "medium" | "high" }
  | { type: "raise_incident" }
  | { type: "begin_recovery" }
  | { type: "recover_ok" }
  | { type: "reset" };

const ALLOWED: Record<
  MonitorState,
  Partial<Record<MonitorEvent["type"], MonitorState>>
> = {
  healthy: {
    observe_ok: "healthy",
    observe_drift: "drift_detected",
    reset: "healthy",
  },
  watching: {
    observe_ok: "healthy",
    observe_drift: "drift_detected",
    reset: "healthy",
  },
  drift_detected: {
    observe_ok: "watching",
    observe_drift: "drift_detected",
    raise_incident: "incident",
    reset: "healthy",
  },
  incident: {
    begin_recovery: "recovering",
    reset: "healthy",
  },
  recovering: {
    recover_ok: "healthy",
    observe_drift: "drift_detected",
    reset: "healthy",
  },
};

export function transitionMonitor(
  state: MonitorState,
  event: MonitorEvent,
): MonitorState {
  if (
    event.type === "observe_drift" &&
    event.severity === "medium" &&
    state === "healthy"
  ) {
    return "watching";
  }
  const next = ALLOWED[state][event.type];
  if (!next) {
    throw new Error(`transitionMonitor: invalid ${event.type} from ${state}`);
  }
  return next;
}
