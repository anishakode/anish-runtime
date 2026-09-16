export type MissingnessReport = {
  total: number;
  missing: number;
  rate: number;
};

/** Count nullish / NaN entries in a numeric series that may include nulls. */
export function missingnessRate(
  values: Array<number | null | undefined>,
): MissingnessReport {
  const total = values.length;
  if (total === 0) {
    return { total: 0, missing: 0, rate: 0 };
  }
  let missing = 0;
  for (const v of values) {
    if (v === null || v === undefined || Number.isNaN(v)) missing += 1;
  }
  return { total, missing, rate: missing / total };
}

export type RangeQualityReport = {
  totalFinite: number;
  inRange: number;
  outOfRange: number;
  rateInRange: number;
  min: number;
  max: number;
};

/** Fraction of finite values inside [min, max] inclusive. */
export function rangeQuality(
  values: number[],
  min: number,
  max: number,
): RangeQualityReport {
  if (min > max) throw new Error("rangeQuality: min must be <= max");
  const finite = values.filter((v) => Number.isFinite(v));
  const totalFinite = finite.length;
  if (totalFinite === 0) {
    return {
      totalFinite: 0,
      inRange: 0,
      outOfRange: 0,
      rateInRange: 0,
      min,
      max,
    };
  }
  let inRange = 0;
  for (const v of finite) {
    if (v >= min && v <= max) inRange += 1;
  }
  return {
    totalFinite,
    inRange,
    outOfRange: totalFinite - inRange,
    rateInRange: inRange / totalFinite,
    min,
    max,
  };
}
