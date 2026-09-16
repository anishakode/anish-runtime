import { buildHistogram, histogramWithEdges } from "./histogram";
import { classifyPsi, populationStabilityIndex } from "./psi";
import { ksDStat, ksSeverity } from "./ks";
import { missingnessRate, rangeQuality } from "./quality";
import { sampleNormal } from "./seed";
import { MLOPS_BOUNDARY_NOTICE, MLOPS_LAB_EVIDENCE_STATE } from "./evidence";

export type ScenarioKind = "baseline" | "drift" | "missing" | "range";

export type ScenarioResult = {
  kind: ScenarioKind;
  evidenceState: typeof MLOPS_LAB_EVIDENCE_STATE;
  boundaryNotice: typeof MLOPS_BOUNDARY_NOTICE;
  reference: number[];
  current: Array<number | null>;
  psi: number | null;
  psiSeverity: ReturnType<typeof classifyPsi>["severity"] | null;
  ksD: number | null;
  ksSeverity: ReturnType<typeof ksSeverity> | null;
  missingness: ReturnType<typeof missingnessRate>;
  range: ReturnType<typeof rangeQuality>;
};

const DEFAULT_BINS = 10;
const RANGE_MIN = -3;
const RANGE_MAX = 3;

function finiteCurrent(values: Array<number | null>): number[] {
  return values.filter((v): v is number => v !== null && Number.isFinite(v));
}

/**
 * Build a reproducible scenario. Drift uses a controlled mean shift (+0.50 by default)
 * matching the M7 BREAK contract magnitude for later reuse.
 */
export function runScenario(options: {
  kind: ScenarioKind;
  seed?: number;
  count?: number;
  shift?: number;
  missingRate?: number;
  rangeMin?: number;
  rangeMax?: number;
}): ScenarioResult {
  const seed = options.seed ?? 42;
  const count = options.count ?? 200;
  const shift = options.shift ?? 0.5;
  const missingRate = options.missingRate ?? 0.25;
  const rangeMin = options.rangeMin ?? RANGE_MIN;
  const rangeMax = options.rangeMax ?? RANGE_MAX;

  if (count < 2) throw new Error("runScenario: count must be >= 2");
  if (missingRate < 0 || missingRate > 1) {
    throw new Error("runScenario: missingRate must be in [0, 1]");
  }

  const reference = sampleNormal(seed, count, 0, 1);
  let current: Array<number | null> = sampleNormal(seed + 1, count, 0, 1);

  switch (options.kind) {
    case "baseline":
      current = sampleNormal(seed, count, 0, 1);
      break;
    case "drift":
      current = sampleNormal(seed + 7, count, shift, 1);
      break;
    case "missing": {
      const base = sampleNormal(seed + 3, count, 0, 1);
      current = base.map((v, i) => (i / count < missingRate ? null : v));
      break;
    }
    case "range": {
      const base = sampleNormal(seed + 5, count, 0, 1);
      current = base.map((v, i) => (i % 7 === 0 ? rangeMax + 2 + (i % 3) : v));
      break;
    }
    default: {
      const _exhaustive: never = options.kind;
      return _exhaustive;
    }
  }

  const refHist = buildHistogram(reference, DEFAULT_BINS);
  const curFinite = finiteCurrent(current);
  const curHist =
    curFinite.length === 0 ? null : histogramWithEdges(curFinite, refHist.edges);

  const psi =
    curHist === null
      ? null
      : populationStabilityIndex(
          refHist.bins.map((b) => b.count),
          curHist.bins.map((b) => b.count),
        );
  const psiClass = psi === null ? null : classifyPsi(psi);

  const ksD = curFinite.length === 0 ? null : ksDStat(reference, curFinite);
  const ksClass = ksD === null ? null : ksSeverity(ksD);

  return {
    kind: options.kind,
    evidenceState: MLOPS_LAB_EVIDENCE_STATE,
    boundaryNotice: MLOPS_BOUNDARY_NOTICE,
    reference,
    current,
    psi,
    psiSeverity: psiClass?.severity ?? null,
    ksD,
    ksSeverity: ksClass,
    missingness: missingnessRate(current),
    range: rangeQuality(curFinite, rangeMin, rangeMax),
  };
}
