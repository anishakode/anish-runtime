import type { EvidenceState } from "./schema";

export function evidenceStateLabel(state: EvidenceState): string {
  return state.replaceAll("_", " ");
}

export function displayHostPath(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, "");
    return `${host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}
