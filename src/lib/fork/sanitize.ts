/**
 * JD sanitize + sensitive-criteria strip (M20).
 * Fork never stores the raw JD; sanitize before extraction.
 */

const SENSITIVE_LINE =
  /\b(salary|compensation|\$\d|£\d|€\d|age\b|gender|sex\b|race\b|ethnic|religion|nationality|citizen(ship)?|visa|green\s*card|married|pregnan|disability|criminal\s*record|political)\b/i;

const MAX_JD_CHARS = 12_000;

export type SanitizeResult = {
  text: string;
  removedLineCount: number;
  truncated: boolean;
};

/** Strip sensitive lines and bound size. Does not invent requirements. */
export function sanitizeJobDescription(raw: string): SanitizeResult {
  const truncated = raw.length > MAX_JD_CHARS;
  const clipped = truncated ? raw.slice(0, MAX_JD_CHARS) : raw;
  const lines = clipped.split(/\r?\n/);
  const kept: string[] = [];
  let removedLineCount = 0;
  for (const line of lines) {
    if (SENSITIVE_LINE.test(line)) {
      removedLineCount += 1;
      continue;
    }
    kept.push(line);
  }
  return {
    text: kept.join("\n").trim(),
    removedLineCount,
    truncated,
  };
}

export { MAX_JD_CHARS };
