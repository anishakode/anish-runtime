/**
 * Two-sample Kolmogorov–Smirnov D — algorithm aligned with pinned
 * `backend/app/utils/stats.py` @ a2ba6fc (MLOps Governance Dashboard).
 */

/**
 * Empirical CDF max absolute difference (two-sample).
 * Matches `ks_d_stat` in stats.py (including tie-break: prefer advancing sample A).
 * Note: identical finite samples yield a small non-zero D for n>1 under that tie rule —
 * this is intentional source parity, not a theoretical textbook KS.
 */
export function ksDStat(sampleA: number[], sampleB: number[]): number {
  if (sampleA.length === 0 || sampleB.length === 0) {
    throw new Error("ksDStat: samples must be non-empty");
  }
  const a = [...sampleA].sort((x, y) => x - y);
  const b = [...sampleB].sort((x, y) => x - y);
  let i = 0;
  let j = 0;
  const na = a.length;
  const nb = b.length;
  let d = 0;
  while (i < na && j < nb) {
    if (a[i] <= b[j]) i += 1;
    else j += 1;
    const fa = i / na;
    const fb = j / nb;
    d = Math.max(d, Math.abs(fa - fb));
  }
  d = Math.max(d, Math.abs(1 - j / nb), Math.abs(1 - i / na));
  return d;
}

export type KsSeverity = "low" | "medium" | "high";

/** Matches `ks_severity` in stats.py (warn=0.10, high=0.20). */
export function ksSeverity(d: number, warn = 0.1, high = 0.2): KsSeverity {
  if (d >= high) return "high";
  if (d >= warn) return "medium";
  return "low";
}
