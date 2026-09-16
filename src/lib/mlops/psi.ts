/**
 * Population Stability Index — algorithm aligned with pinned
 * `backend/app/utils/drift.py` @ a2ba6fc (MLOps Governance Dashboard).
 */

const EPSILON = 1e-12;

function safeProbs(vec: number[]): number[] {
  const sum = vec.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    const n = vec.length;
    if (n === 0) throw new Error("populationStabilityIndex: empty vectors");
    return Array.from({ length: n }, () => 1 / n);
  }
  return vec.map((x) => Math.max(EPSILON, x / sum));
}

/**
 * PSI using binned percentages. expected/actual can be raw counts or percentages.
 * Matches `population_stability_index` in drift.py.
 */
export function populationStabilityIndex(expected: number[], actual: number[]): number {
  if (expected.length !== actual.length) {
    throw new Error("populationStabilityIndex: expected and actual must be same length");
  }
  if (expected.length === 0) {
    throw new Error("populationStabilityIndex: empty vectors");
  }
  const e = safeProbs(expected);
  const a = safeProbs(actual);
  let psi = 0;
  for (let i = 0; i < e.length; i += 1) {
    psi += (a[i] - e[i]) * Math.log(a[i] / e[i]);
  }
  return psi;
}

export type PsiSeverity = "low" | "medium" | "high";

/** Matches `classify_psi` in drift.py (0.10 / 0.25 thresholds). */
export function classifyPsi(psi: number): { severity: PsiSeverity; message: string } {
  if (psi >= 0.25) return { severity: "high", message: "Major drift detected" };
  if (psi >= 0.1) return { severity: "medium", message: "Moderate drift detected" };
  return { severity: "low", message: "Minor/no drift" };
}
