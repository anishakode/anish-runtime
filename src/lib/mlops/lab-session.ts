import { buildHistogram, histogramWithEdges, type Histogram } from "./histogram";
import { classifyPsi, populationStabilityIndex, type PsiSeverity } from "./psi";
import { ksDStat, ksSeverity, type KsSeverity } from "./ks";
import { missingnessRate, rangeQuality } from "./quality";
import { sampleNormal } from "./seed";
import {
  MLOPS_BOUNDARY_NOTICE,
  MLOPS_LAB_EVIDENCE_STATE,
  MLOPS_SOURCE_TRACE,
} from "./evidence";

const DEFAULT_BINS = 10;
const RANGE_MIN = -3;
const RANGE_MAX = 3;
export const LAB_DEFAULT_SEED = 42;
export const LAB_DEFAULT_COUNT = 200;
export const LAB_SHIFT_DELTA = 0.5;
export const LAB_MISSING_RATE = 0.25;

export type LabAction = "baseline" | "shift" | "missing";

export type LabMetrics = {
  psi: number | null;
  psiSeverity: PsiSeverity | null;
  psiMessage: string | null;
  ksD: number | null;
  ksSeverity: KsSeverity | null;
  missingness: ReturnType<typeof missingnessRate>;
  range: ReturnType<typeof rangeQuality>;
  detectorDisagreement: boolean;
};

export type LabSession = {
  seed: number;
  count: number;
  action: LabAction;
  reference: number[];
  current: Array<number | null>;
  referenceHistogram: Histogram;
  currentHistogram: Histogram | null;
  metrics: LabMetrics;
  evidenceState: typeof MLOPS_LAB_EVIDENCE_STATE;
  boundaryNotice: typeof MLOPS_BOUNDARY_NOTICE;
  sourceTrace: typeof MLOPS_SOURCE_TRACE;
};

function finiteCurrent(values: Array<number | null>): number[] {
  return values.filter((v): v is number => v !== null && Number.isFinite(v));
}

function computeMetrics(
  reference: number[],
  current: Array<number | null>,
  referenceHistogram: Histogram,
): { metrics: LabMetrics; currentHistogram: Histogram | null } {
  const curFinite = finiteCurrent(current);
  const currentHistogram =
    curFinite.length === 0
      ? null
      : histogramWithEdges(curFinite, referenceHistogram.edges);

  const psi =
    currentHistogram === null
      ? null
      : populationStabilityIndex(
          referenceHistogram.bins.map((b) => b.count),
          currentHistogram.bins.map((b) => b.count),
        );
  const psiClass = psi === null ? null : classifyPsi(psi);
  const ksD = curFinite.length === 0 ? null : ksDStat(reference, curFinite);
  const ksClass = ksD === null ? null : ksSeverity(ksD);

  const detectorDisagreement =
    psiClass !== null && ksClass !== null && psiClass.severity !== ksClass;

  return {
    currentHistogram,
    metrics: {
      psi,
      psiSeverity: psiClass?.severity ?? null,
      psiMessage: psiClass?.message ?? null,
      ksD,
      ksSeverity: ksClass,
      missingness: missingnessRate(current),
      range: rangeQuality(curFinite, RANGE_MIN, RANGE_MAX),
      detectorDisagreement,
    },
  };
}

function buildSession(
  seed: number,
  count: number,
  action: LabAction,
  reference: number[],
  current: Array<number | null>,
): LabSession {
  const referenceHistogram = buildHistogram(reference, DEFAULT_BINS);
  const { metrics, currentHistogram } = computeMetrics(
    reference,
    current,
    referenceHistogram,
  );
  return {
    seed,
    count,
    action,
    reference,
    current,
    referenceHistogram,
    currentHistogram,
    metrics,
    evidenceState: MLOPS_LAB_EVIDENCE_STATE,
    boundaryNotice: MLOPS_BOUNDARY_NOTICE,
    sourceTrace: MLOPS_SOURCE_TRACE,
  };
}

/** Baseline lab: reference and current drawn from the same seed (aligned distributions). */
export function createLabSession(
  seed = LAB_DEFAULT_SEED,
  count = LAB_DEFAULT_COUNT,
): LabSession {
  if (count < 2) throw new Error("createLabSession: count must be >= 2");
  const reference = sampleNormal(seed, count, 0, 1);
  const current = sampleNormal(seed, count, 0, 1);
  return buildSession(seed, count, "baseline", reference, current);
}

/** Controlled mean shift (+0.50 by default) — same magnitude reserved for M7 BREAK. */
export function shiftLabData(session: LabSession, delta = LAB_SHIFT_DELTA): LabSession {
  const current = sampleNormal(session.seed + 7, session.count, delta, 1);
  return buildSession(session.seed, session.count, "shift", session.reference, current);
}

/** Inject missing values into a fresh baseline-like series. */
export function injectLabMissing(
  session: LabSession,
  rate = LAB_MISSING_RATE,
): LabSession {
  if (rate < 0 || rate > 1) throw new Error("injectLabMissing: rate must be in [0, 1]");
  const base = sampleNormal(session.seed + 3, session.count, 0, 1);
  const current: Array<number | null> = base.map((v, i) =>
    i / session.count < rate ? null : v,
  );
  return buildSession(session.seed, session.count, "missing", session.reference, current);
}

export function resetLabSession(session: LabSession): LabSession {
  return createLabSession(session.seed, session.count);
}

/** Compact rows for the accessible histogram table. */
export function histogramTableRows(session: LabSession) {
  return session.referenceHistogram.bins.map((bin) => {
    const cur = session.currentHistogram?.bins[bin.index];
    return {
      index: bin.index,
      start: bin.start,
      end: bin.end,
      referenceCount: bin.count,
      currentCount: cur?.count ?? 0,
      referenceProportion: bin.proportion,
      currentProportion: cur?.proportion ?? 0,
    };
  });
}
