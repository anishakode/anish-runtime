/**
 * Mulberry32 — small deterministic PRNG for reproducible lab scenarios.
 */
export function createSeededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller transform on a seeded unit RNG → N(mean, stdDev²). */
export function nextGaussian(rng: () => number, mean = 0, stdDev = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

export function sampleNormal(
  seed: number,
  count: number,
  mean = 0,
  stdDev = 1,
): number[] {
  if (count < 0) throw new Error("sampleNormal: count must be >= 0");
  const rng = createSeededRng(seed);
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(nextGaussian(rng, mean, stdDev));
  }
  return out;
}
