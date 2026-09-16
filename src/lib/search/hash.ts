/** Stable content hash without Node crypto (browser-safe). */

export function createHash(value: string): string {
  // FNV-1a 32-bit × two seeds → 16 hex chars; deterministic across runtimes.
  const a = fnv1a(value, 0x811c9dc5);
  const b = fnv1a(value, 0x811c9dc5 ^ 0x01000193);
  return `${a.toString(16).padStart(8, "0")}${b.toString(16).padStart(8, "0")}`;
}

function fnv1a(value: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
