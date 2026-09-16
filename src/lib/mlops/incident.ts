import { createAlertCooldown, tryFireAlert, type AlertCooldownState } from "./alert";
import {
  createLabSession,
  LAB_SHIFT_DELTA,
  resetLabSession,
  shiftLabData,
  type LabSession,
} from "./lab-session";
import { transitionMonitor, type MonitorState } from "./state-machine";

/** Provenance labels for the incident event trace (M7). */
export type TraceKind =
  "runtime_lab" | "code_verified" | "interpretation" | "simulated_notify";

export type TraceEvent = {
  id: string;
  atTick: number;
  kind: TraceKind;
  title: string;
  detail: string;
};

export type DebugStep = {
  id: string;
  title: string;
  detail: string;
  kind: TraceKind;
};

export type IncidentRun = {
  session: LabSession;
  monitor: MonitorState;
  tick: number;
  alert: AlertCooldownState;
  alertFired: boolean;
  trace: TraceEvent[];
  debugSteps: DebugStep[];
  phase: "idle" | "broken" | "investigating" | "recovered";
};

function eid(prefix: string, tick: number): string {
  return `${prefix}-${tick}`;
}

/** Build deterministic “Watch Anish Debug” reasoning from live metrics. */
export function buildDebugSteps(session: LabSession): DebugStep[] {
  const psi = session.metrics.psi;
  const ks = session.metrics.ksD;
  const steps: DebugStep[] = [
    {
      id: "observe",
      title: "Observe controlled disturbance",
      detail: `SHIFT DATA applied mean +${LAB_SHIFT_DELTA.toFixed(2)}. Recomputed PSI=${psi?.toFixed(4) ?? "n/a"}, KS D=${ks?.toFixed(4) ?? "n/a"}.`,
      kind: "runtime_lab",
    },
    {
      id: "classify-psi",
      title: "Classify PSI against verified thresholds",
      detail: `Severity ${session.metrics.psiSeverity ?? "n/a"} via drift.py bands (0.10 medium / 0.25 high).`,
      kind: "code_verified",
    },
    {
      id: "classify-ks",
      title: "Classify KS D against verified bands",
      detail: `Severity ${session.metrics.ksSeverity ?? "n/a"} via stats.py (warn 0.10 / high 0.20).`,
      kind: "code_verified",
    },
  ];

  if (session.metrics.detectorDisagreement) {
    steps.push({
      id: "disagree",
      title: "Detector disagreement",
      detail: `PSI (${session.metrics.psiSeverity}) ≠ KS (${session.metrics.ksSeverity}). Investigate both signals before closing the incident.`,
      kind: "interpretation",
    });
  } else {
    steps.push({
      id: "agree",
      title: "Detectors agree",
      detail:
        "PSI and KS severities align — proceed with a single coherent incident narrative.",
      kind: "interpretation",
    });
  }

  steps.push({
    id: "notify",
    title: "Simulated notification path",
    detail: "Alert recorded in-session only. No Slack/email/webhook left this browser.",
    kind: "simulated_notify",
  });

  steps.push({
    id: "recover-plan",
    title: "Recovery plan",
    detail:
      "Reset distributions to the seeded baseline, clear incident state, re-check metrics at healthy.",
    kind: "interpretation",
  });

  return steps;
}

export function createIncidentRun(seed = 42, count = 200): IncidentRun {
  return {
    session: createLabSession(seed, count),
    monitor: "healthy",
    tick: 0,
    alert: createAlertCooldown(3),
    alertFired: false,
    trace: [],
    debugSteps: [],
    phase: "idle",
  };
}

/**
 * BREAK THE SYSTEM — controlled +0.50 shift, detect, audit, simulated alert, incident.
 */
export function breakTheSystem(run: IncidentRun): IncidentRun {
  let monitor: MonitorState = run.monitor;
  if (monitor !== "healthy") {
    monitor = transitionMonitor(monitor, { type: "reset" });
  }

  const tick = run.tick + 1;
  const session = shiftLabData(run.session, LAB_SHIFT_DELTA);
  const severity =
    session.metrics.psiSeverity === "high" || session.metrics.ksSeverity === "high"
      ? "high"
      : "medium";

  monitor = transitionMonitor(monitor, { type: "observe_drift", severity });
  if (monitor === "watching") {
    monitor = transitionMonitor(monitor, { type: "observe_drift", severity: "high" });
  }
  monitor = transitionMonitor(monitor, { type: "raise_incident" });

  const alertAttempt = tryFireAlert(run.alert, tick);
  const debugSteps = buildDebugSteps(session);

  const trace: TraceEvent[] = [
    ...run.trace,
    {
      id: eid("break", tick),
      atTick: tick,
      kind: "runtime_lab",
      title: "BREAK THE SYSTEM",
      detail: `Controlled +${LAB_SHIFT_DELTA.toFixed(2)} distribution shift applied.`,
    },
    {
      id: eid("metrics", tick),
      atTick: tick,
      kind: "runtime_lab",
      title: "Metrics recomputed",
      detail: `PSI ${session.metrics.psi?.toFixed(4) ?? "n/a"} (${session.metrics.psiSeverity}); KS ${session.metrics.ksD?.toFixed(4) ?? "n/a"} (${session.metrics.ksSeverity}).`,
    },
    {
      id: eid("audit", tick),
      atTick: tick,
      kind: "interpretation",
      title: "Audit event (lab representation)",
      detail: `Monitor → ${monitor}. Lab audit sink — not a production ledger write.`,
    },
    {
      id: eid("alert", tick),
      atTick: tick,
      kind: "simulated_notify",
      title: alertAttempt.fired ? "Simulated alert fired" : "Alert suppressed (cooldown)",
      detail: alertAttempt.reason,
    },
  ];

  return {
    session,
    monitor,
    tick,
    alert: alertAttempt.state,
    alertFired: alertAttempt.fired,
    trace,
    debugSteps,
    phase: "investigating",
  };
}

export function recoverIncident(run: IncidentRun): IncidentRun {
  const tick = run.tick + 1;
  let monitor = run.monitor;
  if (monitor === "incident") {
    monitor = transitionMonitor(monitor, { type: "begin_recovery" });
  }
  if (monitor === "recovering") {
    monitor = transitionMonitor(monitor, { type: "recover_ok" });
  } else {
    monitor = transitionMonitor(monitor, { type: "reset" });
  }

  const session = resetLabSession(run.session);
  const trace: TraceEvent[] = [
    ...run.trace,
    {
      id: eid("recover", tick),
      atTick: tick,
      kind: "runtime_lab",
      title: "Recovery complete",
      detail: "Distributions reset to seeded baseline. Monitor returned to healthy.",
    },
  ];

  return {
    session,
    monitor,
    tick,
    alert: run.alert,
    alertFired: false,
    trace,
    debugSteps: run.debugSteps,
    phase: "recovered",
  };
}

export const TRACE_KIND_LABEL: Record<TraceKind, string> = {
  runtime_lab: "runtime lab",
  code_verified: "code verified",
  interpretation: "code→runtime interpretation",
  simulated_notify: "simulated notify",
};
