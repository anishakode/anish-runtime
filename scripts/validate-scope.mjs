import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Scope validator — blocks accidental product WOW files before their milestones.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Pre-milestone gates. Empty since M23: every WOW surface in the handoff is unlocked.
 * M24 adds no product surface, so nothing new is gated here.
 */
const FORBIDDEN_PATH_FRAGMENTS = [];

const REQUIRED = [
  "AGENTS.md",
  "ANISH_RUNTIME_MASTER_HANDOFF.md",
  "package.json",
  "pnpm-lock.yaml",
  "content/evidence/graph.json",
  "content/evidence/sources.json",
  "content/evidence/nodes.json",
  "content/evidence/edges.json",
  "src/lib/evidence/schema.ts",
  "src/lib/evidence/load-graph.ts",
  "src/lib/evidence/queries.ts",
  "src/components/site-chrome.tsx",
  "src/app/work/page.tsx",
  "src/app/work/[slug]/page.tsx",
  "src/app/experience/page.tsx",
  "src/app/about/page.tsx",
  "src/app/cv/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/llms.txt/route.ts",
  "src/app/not-found.tsx",
  "src/components/evidence-badge.tsx",
  "src/components/project-card.tsx",
  "src/components/print-button.tsx",
  "docs/adr/0001-repository-foundation.md",
  "docs/adr/0002-evidence-graph-truth.md",
  "docs/adr/0003-utility-portfolio.md",
  "docs/adr/0004-editorial-lab-visual-system.md",
  "docs/adr/0005-public-evidence-manifest.md",
  "docs/adr/0006-landing-compilation.md",
  "docs/adr/0007-deterministic-mlops-core.md",
  "docs/adr/0008-mlops-live-lab.md",
  "docs/adr/0009-break-the-system.md",
  "docs/adr/0010-source-trace-mode.md",
  "docs/adr/0011-reversible-architecture.md",
  "docs/adr/0012-project-autopsy.md",
  "docs/adr/0013-project-xray.md",
  "docs/adr/0014-steward-agent-lab.md",
  "docs/adr/0015-malware-explainability-lab.md",
  "docs/adr/0016-failure-museum-evidence-gate.md",
  "docs/adr/0017-deterministic-evidence-search.md",
  "docs/adr/0018-semantic-evidence-retrieval.md",
  "docs/adr/0019-signal-orchestrator.md",
  "docs/adr/0020-adaptive-evidence-composer.md",
  "docs/adr/0021-signal-recompile.md",
  "docs/adr/0022-fork-anish.md",
  "docs/adr/0023-interview-my-work.md",
  "docs/adr/0024-under-the-surface.md",
  "src/lib/signal/orchestrate.ts",
  "src/lib/signal/tools.ts",
  "src/lib/signal/compose.ts",
  "src/lib/signal/ui-plan.ts",
  "src/lib/session/trace.ts",
  "src/lib/session/recompile.ts",
  "src/lib/fork/orchestrate.ts",
  "src/lib/fork/classify.ts",
  "src/app/fork/page.tsx",
  "src/lib/interview/catalog.ts",
  "src/lib/interview/select.ts",
  "src/app/interview/page.tsx",
  "src/lib/surface/layers.ts",
  "src/lib/runtime-trace/trace.ts",
  "src/app/surface/page.tsx",
  "src/lib/ending/signal.ts",
  "src/lib/ending/catalog.ts",
  "src/app/ending/page.tsx",
  "docs/adr/0025-ending-signal.md",
  "src/lib/security/policy.ts",
  "src/lib/security/request-guard.ts",
  "src/lib/security/rate-limit.ts",
  "src/lib/seo/routes.ts",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/error.tsx",
  "src/app/global-error.tsx",
  "src/components/runtime-fault.tsx",
  "src/components/site-chrome-static.tsx",
  "scripts/check-bundle-budget.mjs",
  "e2e/production.spec.ts",
  "src/app/opengraph-image.tsx",
  "src/app/opengraph-image.test.tsx",
  "scripts/live-smoke.mjs",
  "docs/launch/LAUNCH-RUNBOOK.md",
  "docs/launch/LAUNCH-CHECKLIST.md",
  "docs/launch/PUBLIC-PRESENCE.md",
  "docs/adr/0028-launch.md",
  "docs/milestones/M26-LOCK-AUDIT.md",
  "src/lib/sources/verify.ts",
  "src/lib/sources/verify.test.ts",
  "scripts/verify-sources.ts",
  ".github/workflows/verify-sources.yml",
  "docs/presence/README.md",
  "docs/presence/README-mlops-governance-dashboard.md",
  "docs/presence/README-malware-detection.md",
  "docs/presence/README-boring-ai.md",
  "docs/presence/README-steward-ai-patch.md",
  "docs/adr/0029-proof-trail-integrity.md",
  "docs/milestones/M27-REPORT.md",
  "src/lib/freeze/claims.ts",
  "src/lib/freeze/strength.ts",
  "src/lib/freeze/verify.ts",
  "src/lib/freeze/freeze.test.ts",
  "scripts/freeze-evidence.ts",
  "content/evidence/freeze.json",
  "docs/evidence/CLAIM-LEDGER.md",
  "docs/adr/0027-evidence-freeze.md",
  "src/lib/seo/seo.test.ts",
  "src/lib/security/security.test.ts",
  "src/app/metadata.test.ts",
  "src/app/api/signal/interpret/route.rate-limit.test.ts",
  "docs/adr/0026-production-hardening.md",
  "src/app/api/signal/interpret/route.ts",
  "docs/planning/milestones.md",
  "docs/testing/TEST-CATALOG.md",
  "src/lib/visual/tokens.ts",
  "src/lib/evidence/public-manifest.ts",
  "src/lib/evidence/source-trace.ts",
  "src/lib/home/runtime-model.ts",
  "src/lib/mlops/index.ts",
  "src/lib/mlops/lab-session.ts",
  "src/lib/mlops/incident.ts",
  "src/lib/architecture/stages.ts",
  "src/lib/autopsy/lenses.ts",
  "src/lib/xray/layers.ts",
  "src/lib/steward/index.ts",
  "src/lib/steward/scenarios.ts",
  "src/lib/malware/index.ts",
  "src/lib/malware/reconstruction.ts",
  "src/lib/failures/index.ts",
  "src/lib/failures/schema.ts",
  "src/lib/failures/gate.ts",
  "src/lib/failures/exhibits.ts",
  "src/lib/search/index.ts",
  "src/lib/search/rank.ts",
  "src/lib/search/index-build.ts",
  "src/lib/search/semantic.ts",
  "src/lib/search/retrieve.ts",
  "src/components/labs/mlops-lab.tsx",
  "src/app/labs/mlops/page.tsx",
  "src/components/labs/steward-lab.tsx",
  "src/app/labs/steward/page.tsx",
  "src/components/labs/malware-lab.tsx",
  "src/app/labs/malware/page.tsx",
  "src/components/failures/failure-museum.tsx",
  "src/app/failures/page.tsx",
  "src/components/search/ask-runtime.tsx",
  "src/components/home-runtime.tsx",
  "src/components/tier-section.tsx",
  "src/components/source-trace/source-trace-context.tsx",
  "src/components/architecture/reversible-architecture.tsx",
  "src/components/autopsy/project-autopsy.tsx",
  "src/components/xray/project-xray.tsx",
  "src/app/evidence.json/route.ts",
  "src/components/evidence-legend.tsx",
  "src/app/globals.css",
  "src/app/layout.tsx",
];

let failed = false;

for (const rel of REQUIRED) {
  if (!existsSync(join(root, rel))) {
    console.error(`Missing required path: ${rel}`);
    failed = true;
  }
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (!String(pkg.packageManager).startsWith("pnpm@")) {
  console.error("packageManager must be pnpm");
  failed = true;
}

for (const frag of FORBIDDEN_PATH_FRAGMENTS) {
  if (existsSync(join(root, frag))) {
    console.error(`Out-of-scope path present before milestone unlock: ${frag}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("Scope validation OK");
