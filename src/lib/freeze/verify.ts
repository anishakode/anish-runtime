import type { EvidenceState } from "@/lib/evidence/states";
import { type Claim, corpusDigest } from "./claims";
import { isStrengthening } from "./strength";

/**
 * Freeze verification (M25).
 *
 * The freeze answers one question: has anything Anish publicly claims changed since
 * the owner froze it? Drift is not silently absorbed — it fails the build until the
 * change is recorded. A recorded change is still a change; the mechanism makes it
 * loud and attributable, it does not make it impossible. Git history is the
 * tamper-evidence, not this file.
 */

export const FREEZE_SCHEMA_ID = "anish-runtime/evidence-freeze";
export const FREEZE_SCHEMA_VERSION = 1;

export type FreezeStatus = "PENDING_OWNER_CONFIRMATION" | "OWNER_CONFIRMED";

export type FrozenClaim = {
  kind: string;
  statement: string;
  evidenceState: EvidenceState | null;
  evidence: string[];
  digest: string;
};

export type ChangeControlEntry = {
  date: string;
  claimId: string;
  /** Digest before the change, or null when the claim is newly added. */
  from: string | null;
  /** Digest after the change, or null when the claim is being retired. */
  to: string | null;
  owner: string;
  reason: string;
  /** Required when a claim moves to a stronger evidence state. */
  strengthening?: {
    from: EvidenceState;
    to: EvidenceState;
    newEvidence: string[];
  };
};

export type FreezeManifest = {
  schema: string;
  schemaVersion: number;
  status: FreezeStatus;
  frozenAt: string;
  corpusDigest: string;
  claims: Record<string, FrozenClaim>;
  changeControl: ChangeControlEntry[];
};

export type FreezeViolation = {
  claimId: string;
  kind: "ADDED" | "CHANGED" | "REMOVED" | "STRENGTHENED" | "MANIFEST";
  detail: string;
};

export type FreezeResult = {
  ok: boolean;
  violations: FreezeViolation[];
  /** Changes that were permitted because change control records them. */
  accepted: string[];
  currentDigest: string;
};

function authorises(
  entries: ChangeControlEntry[],
  claimId: string,
  from: string | null,
  to: string | null,
): ChangeControlEntry | undefined {
  return entries.find(
    (entry) => entry.claimId === claimId && entry.from === from && entry.to === to,
  );
}

export function buildFreezeManifest(
  claims: Claim[],
  options: { status: FreezeStatus; frozenAt: string },
): FreezeManifest {
  const frozen: Record<string, FrozenClaim> = {};
  for (const claim of claims) {
    frozen[claim.id] = {
      kind: claim.kind,
      statement: claim.statement,
      evidenceState: claim.evidenceState,
      evidence: claim.evidence,
      digest: claim.digest,
    };
  }
  return {
    schema: FREEZE_SCHEMA_ID,
    schemaVersion: FREEZE_SCHEMA_VERSION,
    status: options.status,
    frozenAt: options.frozenAt,
    corpusDigest: corpusDigest(claims),
    claims: frozen,
    changeControl: [],
  };
}

export function verifyFreeze(claims: Claim[], manifest: FreezeManifest): FreezeResult {
  const violations: FreezeViolation[] = [];
  const accepted: string[] = [];

  if (manifest.schema !== FREEZE_SCHEMA_ID) {
    violations.push({
      claimId: "-",
      kind: "MANIFEST",
      detail: `unknown freeze schema "${manifest.schema}"`,
    });
  }
  if (manifest.schemaVersion !== FREEZE_SCHEMA_VERSION) {
    violations.push({
      claimId: "-",
      kind: "MANIFEST",
      detail: `freeze schema version ${manifest.schemaVersion} cannot be read by version ${FREEZE_SCHEMA_VERSION}`,
    });
  }

  const current = new Map(claims.map((claim) => [claim.id, claim]));
  const control = manifest.changeControl ?? [];

  for (const [claimId, frozen] of Object.entries(manifest.claims)) {
    const live = current.get(claimId);

    if (!live) {
      if (authorises(control, claimId, frozen.digest, null)) {
        accepted.push(`${claimId} retired`);
      } else {
        violations.push({
          claimId,
          kind: "REMOVED",
          detail: `frozen claim is gone: "${frozen.statement}"`,
        });
      }
      continue;
    }

    if (live.digest === frozen.digest) continue;

    const entry = authorises(control, claimId, frozen.digest, live.digest);
    const strengthened =
      frozen.evidenceState !== null &&
      live.evidenceState !== null &&
      isStrengthening(frozen.evidenceState, live.evidenceState);

    if (!entry) {
      violations.push({
        claimId,
        kind: strengthened ? "STRENGTHENED" : "CHANGED",
        detail: strengthened
          ? `evidence state rose from ${frozen.evidenceState} to ${live.evidenceState} with no change-control entry`
          : `"${frozen.statement}" → "${live.statement}"`,
      });
      continue;
    }

    // A stronger claim needs more than a note: it needs the evidence that earned it.
    if (strengthened) {
      const proof = entry.strengthening;
      if (
        !proof ||
        proof.from !== frozen.evidenceState ||
        proof.to !== live.evidenceState ||
        proof.newEvidence.length === 0
      ) {
        violations.push({
          claimId,
          kind: "STRENGTHENED",
          detail: `change control records the edit but not the evidence for ${frozen.evidenceState} → ${live.evidenceState}`,
        });
        continue;
      }
    }

    accepted.push(`${claimId} changed (${entry.reason})`);
  }

  for (const claim of claims) {
    if (claim.id in manifest.claims) continue;
    if (authorises(control, claim.id, null, claim.digest)) {
      accepted.push(`${claim.id} added`);
    } else {
      violations.push({
        claimId: claim.id,
        kind: "ADDED",
        detail: `new public claim outside the freeze: "${claim.statement}"`,
      });
    }
  }

  return {
    ok: violations.length === 0,
    violations,
    accepted,
    currentDigest: corpusDigest(claims),
  };
}

/** Claims whose only backing is the owner's word — the ledger must say so plainly. */
export function ownerOnlyClaims(claims: Claim[]): Claim[] {
  return claims.filter(
    (claim) =>
      claim.evidenceState === "OWNER_CONFIRMED_PROFESSIONAL" ||
      claim.evidenceState === "RESUME_DOCUMENTED" ||
      claim.evidence.length === 0,
  );
}
