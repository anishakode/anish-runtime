/**
 * Signal tool session — request-local allowlist + exposed-ID gate (M17).
 */

export type ExposedBucket = "evidence" | "project" | "source";

export class SignalToolSession {
  private readonly exposed = {
    evidence: new Set<string>(),
    project: new Set<string>(),
    source: new Set<string>(),
  };

  expose(bucket: ExposedBucket, ids: readonly string[]) {
    for (const id of ids) {
      if (id) this.exposed[bucket].add(id);
    }
  }

  isExposed(bucket: ExposedBucket, id: string): boolean {
    return this.exposed[bucket].has(id);
  }

  snapshot() {
    return {
      evidence: [...this.exposed.evidence],
      project: [...this.exposed.project],
      source: [...this.exposed.source],
    };
  }
}
