import type { EvidenceGraph } from "@/lib/evidence/schema";

export type EvidenceSource = EvidenceGraph["sources"][number];

/**
 * Source kinds that are allowed to carry no URL, because there is nothing
 * public to point at. Anything else without a URL is a provenance gap, not a
 * style choice.
 */
export const URL_EXEMPT_SOURCE_TYPES = [
  "owner_confirmation",
  "resume",
  "portfolio_runtime",
] as const;

export type SourceCheckStatus = "reachable" | "unreachable" | "exempt" | "gap";

export type SourceCheck = {
  id: string;
  type: string;
  url: string | null;
  status: SourceCheckStatus;
  detail: string;
};

export type SourceVerification = {
  checks: SourceCheck[];
  failures: SourceCheck[];
  checked: number;
  exempt: number;
};

/** Minimal shape so tests can drive this without a network. */
export type HeadFetcher = (url: string) => Promise<{ ok: boolean; status: number }>;

function isExempt(type: string): boolean {
  return (URL_EXEMPT_SOURCE_TYPES as readonly string[]).includes(type);
}

/**
 * Re-checks that the evidence the site cites as proof still resolves.
 *
 * The freeze (M25) guarantees a claim has not changed locally. It cannot know
 * that a repository was renamed or a file moved, which would leave the site
 * presenting dead links as proof — true when written, false today.
 */
export async function verifySources(
  sources: readonly EvidenceSource[],
  head: HeadFetcher,
): Promise<SourceVerification> {
  const checks: SourceCheck[] = [];

  for (const source of sources) {
    const url = source.url ?? null;

    if (!url) {
      checks.push(
        isExempt(source.type)
          ? {
              id: source.id,
              type: source.type,
              url: null,
              status: "exempt",
              detail: "no public URL by design",
            }
          : {
              id: source.id,
              type: source.type,
              url: null,
              status: "gap",
              detail: `${source.type} must carry a URL — only ${URL_EXEMPT_SOURCE_TYPES.join(", ")} may omit one`,
            },
      );
      continue;
    }

    try {
      const response = await head(url);
      checks.push({
        id: source.id,
        type: source.type,
        url,
        status: response.ok ? "reachable" : "unreachable",
        detail: response.ok ? `${response.status}` : `HTTP ${response.status}`,
      });
    } catch (error) {
      // A network error is not a pass. Treat it as unreachable and let the
      // caller decide whether to tolerate it.
      checks.push({
        id: source.id,
        type: source.type,
        url,
        status: "unreachable",
        detail: error instanceof Error ? error.message : "request failed",
      });
    }
  }

  return {
    checks,
    failures: checks.filter((c) => c.status === "unreachable" || c.status === "gap"),
    checked: checks.filter((c) => c.status !== "exempt").length,
    exempt: checks.filter((c) => c.status === "exempt").length,
  };
}

/** A pinned GitHub URL must carry the commit it claims to be pinned to. */
export function urlMatchesPin(source: EvidenceSource): boolean {
  if (!source.url || !source.commitSha) return true;
  return source.url.includes(source.commitSha);
}
