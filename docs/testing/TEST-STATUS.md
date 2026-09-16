# Test status (unit)

**Generated:** 2026-09-16T18:50:55.926Z  
**Result:** PASS  
**Counts:** 470 passed · 0 failed · 0 pending · 470 total

See also [`TEST-CATALOG.md`](./TEST-CATALOG.md) for what each suite is meant to protect.

> E2e is separate from this file. CI and `pnpm ci:full` run it against a production build (`pnpm test:e2e:prod`), which is the only way the CSP, security headers, and noindex policy are asserted. Plain `pnpm ci` stops at the bundle budget; record e2e results manually after a local run.

## Last unit run

| File | Test | Status |
|------|------|--------|
| `src/app/error.test.tsx` | route error boundary (M24) keeps the recruiter path reachable when a surface fails | **PASSED** |
| `src/app/error.test.tsx` | route error boundary (M24) offers retry and states that nothing was stored | **PASSED** |
| `src/app/error.test.tsx` | route error boundary (M24) shows the digest instead of a stack trace | **PASSED** |
| `src/app/error.test.tsx` | route error boundary (M24) omits the digest line when the runtime did not supply one | **PASSED** |
| `src/app/error.test.tsx` | labs error boundary (M24) frames a failed lab as optional and points back to the evidence | **PASSED** |
| `src/app/error.test.tsx` | global error boundary (M24) renders a self-contained shell with recruiter links and no stack trace | **PASSED** |
| `src/app/metadata.test.ts` | root metadata (M24) owns the title template so pages carry only their own name | **PASSED** |
| `src/app/metadata.test.ts` | root metadata (M24) describes the site from the graph, not hardcoded copy | **PASSED** |
| `src/app/metadata.test.ts` | root metadata (M24) declares the single light colour scheme it actually ships | **PASSED** |
| `src/app/metadata.test.ts` | root metadata (M24) stays origin-relative until NEXT_PUBLIC_SITE_URL is configured | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) covers every classified route | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) / declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /work declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /experience declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /about declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /cv declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /contact declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /failures declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /labs/mlops declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /labs/steward declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /labs/malware declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /ending declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /surface declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /fork declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /interview declares a title and never re-suffixes the site name | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) / declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /work declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /experience declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /about declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /cv declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /contact declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /failures declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /labs/mlops declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /labs/steward declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /labs/malware declares its own canonical URL | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /ending is marked noindex, nofollow | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /surface is marked noindex, nofollow | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /fork is marked noindex, nofollow | **PASSED** |
| `src/app/metadata.test.ts` | page metadata (M24) /interview is marked noindex, nofollow | **PASSED** |
| `src/app/metadata.test.ts` | project detail metadata (M24) canonicalises to the project slug and titles from the graph | **PASSED** |
| `src/app/metadata.test.ts` | project detail metadata (M24) claims no canonical URL for a slug that does not exist | **PASSED** |
| `src/app/opengraph-image.test.tsx` | social preview card (M26) declares the dimensions the platforms expect | **PASSED** |
| `src/app/opengraph-image.test.tsx` | social preview card (M26) says only what the Evidence Graph says | **PASSED** |
| `src/app/opengraph-image.test.tsx` | social preview card (M26) makes no claim the corpus cannot back | **PASSED** |
| `src/app/page.test.tsx` | HomePage — recruiter contracts exposes identity and recruiter CTAs from the Evidence Graph without running | **PASSED** |
| `src/app/page.test.tsx` | HomePage — recruiter contracts does not expose the excluded obsolete email | **PASSED** |
| `src/components/evidence-legend.test.tsx` | EvidenceBadge + legend (M3) keeps textual state labels (colour is never the only cue) | **PASSED** |
| `src/components/evidence-legend.test.tsx` | EvidenceBadge + legend (M3) covers every EvidenceState in the legend data | **PASSED** |
| `src/components/evidence-legend.test.tsx` | EvidenceBadge + legend (M3) renders every evidence state label in the legend UI | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) keeps recruiter identity and CTAs visible before RUN | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) compiles through four steps then settles with graph-backed counts | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) Skip jumps to ready and moves focus to the ready heading | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) Escape during compilation settles the runtime | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) reduced motion settles immediately on RUN | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) Reset returns to the readable idle landing and refocuses RUN | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) 20 SEC settle shows one flagship, hides constellation, CV primary | **PASSED** |
| `src/components/home-runtime.test.tsx` | HomeRuntime (M4) EXPLORE settle keeps constellation and browse-all primary | **PASSED** |
| `src/app/contact/page.test.tsx` | ContactPage — identity hygiene links only canonical graph contact channels | **PASSED** |
| `src/app/about/page.test.tsx` | AboutPage renders profile and both education records from the graph | **PASSED** |
| `src/app/cv/page.test.tsx` | CvPage prints graph-backed identity, experience metrics, and selected projects | **PASSED** |
| `src/app/ending/page.test.tsx` | Ending page (M23) exposes the Ending Signal without gating recruiter routes | **PASSED** |
| `src/app/ending/page.test.tsx` | Ending page (M23) uses canonical contact channels from the graph, not excluded ones | **PASSED** |
| `src/app/failures/page.test.tsx` | FailuresPage (M14) frames the empty museum and keeps recruiter paths ungated | **PASSED** |
| `src/app/experience/page.test.tsx` | ExperiencePage — provenance honesty shows Cardstack metrics with owner-confirmation note and state badge | **PASSED** |
| `src/app/fork/page.test.tsx` | Fork page (M20) exposes Fork Anish without gating recruiter routes | **PASSED** |
| `src/app/interview/page.test.tsx` | Interview page (M21) exposes Interview My Work without gating recruiter routes | **PASSED** |
| `src/app/interview/page.test.tsx` | Interview page (M21) states the answer-key boundary before any question set exists | **PASSED** |
| `src/app/interview/page.test.tsx` | Interview page (M21) promises no answer, score, or ranking in the page framing | **PASSED** |
| `src/app/surface/page.test.tsx` | Surface page (M22) exposes Under the Surface without gating recruiter routes | **PASSED** |
| `src/app/surface/page.test.tsx` | Surface page (M22) shows the runtime trace as unavailable outside the provider rather than faking it | **PASSED** |
| `src/app/work/page.test.tsx` | WorkPage — evidence-first listing lists all flagship projects with evidence badges | **PASSED** |
| `src/app/work/page.test.tsx` | WorkPage — evidence-first listing keeps supporting and archive tiers non-empty from corpus | **PASSED** |
| `src/app/work/page.test.tsx` | WorkPage — evidence-first listing renders empty-tier copy when a tier has no projects | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) defines exactly five ordered handoff stages | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) clamps scrubber indices and supports prev/next bounds | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) reveals stages cumulatively | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) architectureStageAt throws only via clamp (always defined) | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) builds views whose sources exist in the Evidence Graph | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) keeps system-boundary as portfolio simulation with PORTFOLIO_EXTENSION framing | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) does not invent Grafana or production telemetry copy | **PASSED** |
| `src/lib/architecture/stages.test.ts` | architecture stages (M9) only calls a stage code-verified when every node it cites is | **PASSED** |
| `src/lib/autopsy/lenses.test.ts` | autopsy lenses (M10) defines the six handoff lenses with STORY as default | **PASSED** |
| `src/lib/autopsy/lenses.test.ts` | autopsy lenses (M10) parses lens ids and falls back on invalid input | **PASSED** |
| `src/lib/autopsy/lenses.test.ts` | autopsy lenses (M10) maps deep-link hashes to lenses (X-Ray / architecture open X-RAY) | **PASSED** |
| `src/lib/autopsy/lenses.test.ts` | autopsy lenses (M10) builds MLOps story/decisions from the Evidence Graph only | **PASSED** |
| `src/lib/autopsy/lenses.test.ts` | autopsy lenses (M10) keeps FAILURES empty and NOT_DEMONSTRATED (no fabricated exhibits) | **PASSED** |
| `src/lib/autopsy/malware-bundle.test.ts` | malware autopsy bundle (M13) builds story/decisions from the Evidence Graph only | **PASSED** |
| `src/lib/autopsy/malware-bundle.test.ts` | malware autopsy bundle (M13) keeps FAILURES empty and preserves LIMITED SHAP decision | **PASSED** |
| `src/lib/autopsy/malware-bundle.test.ts` | malware autopsy bundle (M13) labels the lab-boundary decision as PORTFOLIO_EXTENSION | **PASSED** |
| `src/lib/autopsy/malware-bundle.test.ts` | malware autopsy bundle (M13) fails closed when the malware project is missing from the graph | **PASSED** |
| `src/lib/autopsy/steward-bundle.test.ts` | steward autopsy bundle (M12) builds story/decisions from the Evidence Graph only | **PASSED** |
| `src/lib/autopsy/steward-bundle.test.ts` | steward autopsy bundle (M12) keeps FAILURES empty and NOT_DEMONSTRATED | **PASSED** |
| `src/lib/autopsy/steward-bundle.test.ts` | steward autopsy bundle (M12) includes PORTFOLIO_EXTENSION lab-boundary decision | **PASSED** |
| `src/lib/ending/ending.test.ts` | journey catalogue (M23) resolves canonical items to graph-backed labels and hrefs | **PASSED** |
| `src/lib/ending/ending.test.ts` | journey catalogue (M23) has no entry for free-text query refs | **PASSED** |
| `src/lib/ending/ending.test.ts` | classifyDensity (M23) keeps an inactive session SHALLOW | **PASSED** |
| `src/lib/ending/ending.test.ts` | classifyDensity (M23) promotes to STANDARD on modest exploration or a single action | **PASSED** |
| `src/lib/ending/ending.test.ts` | classifyDensity (M23) requires both node and action depth for DEEP | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) returns an empty, honest signal for a visitor who did nothing | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) orders canonical nodes by first visit and keeps the visit reason | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) discards non-canonical refs instead of rendering them | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) separates completed challenges from ordinary runtime actions | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) reaches DEEP only when a real session earns it | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) omits the thread when no deterministic lead exists | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) publishes an integrity manifest with zeroed tracking and inference | **PASSED** |
| `src/lib/ending/ending.test.ts` | buildEndingSignal (M23) declares the excluded inference categories | **PASSED** |
| `src/lib/failures/gate.test.ts` | Failure Museum gate + dataset (M14) keeps the canonical exhibit dataset empty | **PASSED** |
| `src/lib/failures/gate.test.ts` | Failure Museum gate + dataset (M14) lists publication requirements that encode the artifact gate | **PASSED** |
| `src/lib/failures/gate.test.ts` | Failure Museum gate + dataset (M14) rejects fabricated remembered-failure drafts at the gate | **PASSED** |
| `src/lib/failures/gate.test.ts` | Failure Museum gate + dataset (M14) accepts a complete artifact-backed exhibit that is not in the canonical set | **PASSED** |
| `src/lib/failures/gate.test.ts` | Failure Museum gate + dataset (M14) projects an empty museum from the Evidence Graph boundary node | **PASSED** |
| `src/lib/failures/gate.test.ts` | Failure Museum gate + dataset (M14) would surface published exhibits only when supplied (future renderer path) | **PASSED** |
| `src/lib/failures/schema.test.ts` | FailureExhibitSchema (M14) accepts a fully artifact-backed published exhibit | **PASSED** |
| `src/lib/failures/schema.test.ts` | FailureExhibitSchema (M14) rejects published exhibits with zero artifacts | **PASSED** |
| `src/lib/failures/schema.test.ts` | FailureExhibitSchema (M14) rejects published exhibits with NOT_DEMONSTRATED state | **PASSED** |
| `src/lib/failures/schema.test.ts` | FailureExhibitSchema (M14) rejects claimed metrics that do not cite an artifact on the exhibit | **PASSED** |
| `src/lib/failures/schema.test.ts` | FailureExhibitSchema (M14) rejects GitHub artifacts without immutable commit SHA | **PASSED** |
| `src/lib/failures/schema.test.ts` | FailureExhibitSchema (M14) allows draft exhibits without artifacts (not publishable) | **PASSED** |
| `src/lib/fork/fork.test.ts` | sanitizeJobDescription (M20) removes sensitive salary and demographic lines | **PASSED** |
| `src/lib/fork/fork.test.ts` | extractRequirements (M20) pulls bullets under a Requirements heading | **PASSED** |
| `src/lib/fork/fork.test.ts` | extractRequirements (M20) deduplicates identical requirements | **PASSED** |
| `src/lib/fork/fork.test.ts` | classifyRequirement (M20) never upgrades semantic-only matches to VERIFIED | **PASSED** |
| `src/lib/fork/fork.test.ts` | classifyRequirement (M20) caps every semantic match at LIMITED, not just the one case | **PASSED** |
| `src/lib/fork/fork.test.ts` | classifyRequirement (M20) marks unknown skills as NOT_DEMONSTRATED | **PASSED** |
| `src/lib/fork/fork.test.ts` | classifyRequirement (M20) can VERIFIED-match public MLOps monitoring evidence deterministically | **PASSED** |
| `src/lib/fork/fork.test.ts` | forkFromJobDescription (M20) builds a temporary branch with integrity manifest and no fit score | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) loads a validated graph with expected scale | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) keeps canonical email and exclusions coherent | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) marks Cardstack metrics as owner-confirmed only | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) labels MLOps runtime lab as portfolio extension | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) keeps malware SHAP detail limited | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) fingerprints flagship GitHub sources with commit SHAs | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) keeps unique project slugs and requires nodes per project | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) retains boundary honesty nodes even if UI-deferred | **PASSED** |
| `src/lib/evidence/load-graph.test.ts` | canonical Evidence Graph (M1) requires every GitHub source to be SHA-pinned with url | **PASSED** |
| `src/lib/evidence/public-manifest.test.ts` | public evidence manifest (M3.5) is a derived projection with schema markers | **PASSED** |
| `src/lib/evidence/public-manifest.test.ts` | public evidence manifest (M3.5) mirrors canonical graph scale without inventing nodes | **PASSED** |
| `src/lib/evidence/public-manifest.test.ts` | public evidence manifest (M3.5) fingerprints every public source and keeps GitHub SHAs | **PASSED** |
| `src/lib/evidence/public-manifest.test.ts` | public evidence manifest (M3.5) does not leak excluded identity into the public projection | **PASSED** |
| `src/lib/evidence/public-manifest.test.ts` | public evidence manifest (M3.5) fails closed if an excluded email is injected into profile copy | **PASSED** |
| `src/lib/evidence/queries.test.ts` | evidence queries — strict contracts resolves profile and exact project slug map | **PASSED** |
| `src/lib/evidence/queries.test.ts` | evidence queries — strict contracts returns undefined for unknown slugs (404 contract) | **PASSED** |
| `src/lib/evidence/queries.test.ts` | evidence queries — strict contracts pins flagship repo links to fingerprinted tree URLs | **PASSED** |
| `src/lib/evidence/queries.test.ts` | evidence queries — strict contracts marks missing fingerprints as unpinned (must not silently claim proof) | **PASSED** |
| `src/lib/evidence/queries.test.ts` | evidence queries — strict contracts surfaces owner-confirmation notes for Cardstack metrics | **PASSED** |
| `src/lib/evidence/queries.test.ts` | evidence queries — strict contracts loads evidence nodes for every project slug used in routes | **PASSED** |
| `src/lib/evidence/queries.test.ts` | evidence queries — strict contracts derives contact display paths from profile URLs only | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts accepts the canonical corpus | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects duplicate project slugs | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects duplicate education ids | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects duplicate experience ids | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects GitHub sources with short commitSha | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects GitHub sources missing url | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects GitHub sources missing commitSha | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects projects with no linked nodes | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects node referencing missing source | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects excluded email reintroduced in corpus text | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects excluded profile token reintroduced in corpus text | **PASSED** |
| `src/lib/evidence/schema.test.ts` | EvidenceGraphSchema — fail-first contracts rejects canonical email listed in exclusions | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | resolveSourceTrace resolves SHA-pinned GitHub sources for a claim | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | resolveSourceTrace rejects empty claim labels | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | resolveSourceTrace rejects empty source ids | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | resolveSourceTrace rejects unknown source ids | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | resolveSourceTrace marks unpinned sources when commitSha or url missing | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | lab source traces PSI and KS lab traces match Evidence Graph fingerprints | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | lab source traces Steward MCP lab trace matches Evidence Graph fingerprints | **PASSED** |
| `src/lib/evidence/source-trace.test.ts` | lab source traces Malware report and SHAP lab traces match Evidence Graph fingerprints | **PASSED** |
| `src/lib/home/runtime-model.test.ts` | home runtime model (M4) defaults journey to 2 MIN and exposes four compilation steps | **PASSED** |
| `src/lib/home/runtime-model.test.ts` | home runtime model (M4) paces compilation faster for 20 SEC than 2 MIN | **PASSED** |
| `src/lib/home/runtime-model.test.ts` | home runtime model (M4) differentiates settled journeys without inventing evidence | **PASSED** |
| `src/lib/home/runtime-model.test.ts` | home runtime model (M4) derives capabilities only from graph positioning and flagship themes | **PASSED** |
| `src/lib/home/runtime-model.test.ts` | home runtime model (M4) lists exactly the flagship projects from the graph | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) claims every public surface the handoff lists | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) gives every claim a unique id | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) covers every project, source, and non-metric node exactly once | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) claims the identity facts a reader would hold Anish to | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) records the commit pin as part of a source claim | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) says plainly when a source has no commit pin | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) digests the meaning, not the key order | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) changes the digest when a claim's substance changes | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | claim projection (M25) names the claims that rest on the owner's word alone | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | evidence strength ranking (M25) ranks every state in the vocabulary | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | evidence strength ranking (M25) treats verified as stronger than owner-confirmed, résumé, and limited | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | evidence strength ranking (M25) treats weakening and no change as allowed directions | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) passes when nothing has moved | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) fails when a claim's wording changes | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) reports a stronger evidence state as STRENGTHENED, not a plain change | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) fails when a frozen claim disappears | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) fails when a new public claim appears outside the freeze | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) accepts a change that change control records | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) refuses a change-control entry that does not match the actual change | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) refuses a strengthening that records no new evidence | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) allows weakening without ceremony but still records it | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | freeze verification (M25) rejects a manifest it cannot read | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | committed freeze manifest (M25) matches the live corpus | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | committed freeze manifest (M25) is a manifest this code can read | **PASSED** |
| `src/lib/freeze/freeze.test.ts` | committed freeze manifest (M25) states honestly whether the owner has confirmed the corpus | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) pins the six static feature ids and weights | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) parses feature ids, drops unknowns, and falls back to defaults | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) is deterministic for the same feature set | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) pins exact study-signal math for default and empty sets | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) pins tier thresholds and full-feature signal | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) dedupes enabled ids and ignores non-feature strings at run time | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) withholds security verdicts and keeps SHAP limited for every set | **PASSED** |
| `src/lib/malware/reconstruction.test.ts` | malware reconstruction (M13) toggles features without duplicates and preserves order of remaining | **PASSED** |
| `src/lib/mlops/incident.test.ts` | mlops incident (M7) BREAK THE SYSTEM shifts data, enters incident, and builds a labeled debug path | **PASSED** |
| `src/lib/mlops/incident.test.ts` | mlops incident (M7) RECOVER resets distributions and returns monitor to healthy | **PASSED** |
| `src/lib/mlops/incident.test.ts` | mlops incident (M7) is deterministic for the same seed | **PASSED** |
| `src/lib/mlops/lab-session.test.ts` | mlops lab session (M6) creates a reproducible baseline session | **PASSED** |
| `src/lib/mlops/lab-session.test.ts` | mlops lab session (M6) SHIFT DATA raises drift metrics vs baseline | **PASSED** |
| `src/lib/mlops/lab-session.test.ts` | mlops lab session (M6) INJECT MISSING increases missingness and RESET restores baseline | **PASSED** |
| `src/lib/mlops/lab-session.test.ts` | mlops lab session (M6) histogram table exposes every reference bin for a11y | **PASSED** |
| `src/lib/mlops/lab-session.test.ts` | mlops lab session (M6) rejects invalid session inputs | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops PSI (M5) — aligned with drift.py returns ~0 for identical distributions | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops PSI (M5) — aligned with drift.py detects major drift for heavily shifted bins | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops PSI (M5) — aligned with drift.py rejects mismatched lengths and empty vectors | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops PSI (M5) — aligned with drift.py classifies medium band at 0.10 threshold | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops KS (M5) — aligned with stats.py matches pinned stats.py tie-break behavior on identical samples | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops KS (M5) — aligned with stats.py grows when distributions separate | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops KS (M5) — aligned with stats.py rejects empty samples | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops histogram (M5) bins values and preserves total | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops histogram (M5) aligns current counts to reference edges for PSI | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops histogram (M5) rejects invalid binCount | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops histogram (M5) clamps out-of-range values to the nearest edge, in both directions | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops histogram (M5) bins identically to buildHistogram over the same edges | **PASSED** |
| `src/lib/mlops/metrics.test.ts` | mlops histogram (M5) puts an edge value in the bin it opens, not the one it closes | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops quality (M5) computes missingness including NaN | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops quality (M5) measures range quality and rejects inverted bounds | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops state machine (M5) routes medium drift to watching and high drift to detected | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops state machine (M5) supports incident → recovering → healthy | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops state machine (M5) rejects illegal transitions | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops alert cooldown (M5) fires then suppresses until cooldown elapses | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops alert cooldown (M5) rejects negative cooldown | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops scenarios (M5) labels every scenario as PORTFOLIO_EXTENSION with boundary notice | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops scenarios (M5) is deterministic for the same seed and kind | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops scenarios (M5) baseline stays low severity while drift elevates metrics | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops scenarios (M5) missing scenario raises missingness; range scenario drops in-range rate | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops scenarios (M5) rejects invalid inputs | **PASSED** |
| `src/lib/mlops/scenarios.test.ts` | mlops scenarios (M5) Source Trace IDs match the Evidence Graph MLOps anchors | **PASSED** |
| `src/lib/mlops/seed.test.ts` | mlops seed (M5) produces identical sequences for the same seed | **PASSED** |
| `src/lib/mlops/seed.test.ts` | mlops seed (M5) diverges for different seeds | **PASSED** |
| `src/lib/mlops/seed.test.ts` | mlops seed (M5) sampleNormal is reproducible and rejects negative counts | **PASSED** |
| `src/lib/interview/interview.test.ts` | interview catalogue binding (M21) binds every catalogue question to canonical evidence nodes | **PASSED** |
| `src/lib/interview/interview.test.ts` | interview catalogue binding (M21) reports real source counts from the graph | **PASSED** |
| `src/lib/interview/interview.test.ts` | interview catalogue binding (M21) drops questions whose evidence is absent from the graph | **PASSED** |
| `src/lib/interview/interview.test.ts` | interview catalogue binding (M21) never carries an answer key | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) returns no questions for an empty trail | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) ignores free-text query inputs — search alone cannot create questions | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) explains honestly when the trail has no catalogued topic | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) caps the set at three questions and keeps archetypes distinct | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) is deterministic for the same trail | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) collapses repeated visits to one canonical item | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) records the canonical triggers that earned each question | **PASSED** |
| `src/lib/interview/interview.test.ts` | selectInterviewSet (M21) passes weak evidence states through without upgrading them | **PASSED** |
| `src/lib/search/rank.test.ts` | normalize + levenshtein (M15) normalizes punctuation and case | **PASSED** |
| `src/lib/search/rank.test.ts` | normalize + levenshtein (M15) computes bounded edit distance | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) builds an index from projects, nodes, experience, education, and profile | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) returns empty hits for empty or whitespace queries | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) ranks exact title ahead of weaker matches | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) matches exact aliases such as cardstack | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) matches prefixes for MLOps | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) matches keyword tokens across title/summary | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) recovers bounded typos without inventing entities | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) preserves LIMITED_EVIDENCE and NOT_DEMONSTRATED without upgrading | **PASSED** |
| `src/lib/search/rank.test.ts` | searchEvidence ranking (M15) never mutates document evidence states while ranking | **PASSED** |
| `src/lib/search/semantic.test.ts` | semantic documents + vectors (M16) derives a semantic document for every search entity with a content hash | **PASSED** |
| `src/lib/search/semantic.test.ts` | semantic documents + vectors (M16) returns semantic hits for natural-language intent queries | **PASSED** |
| `src/lib/search/semantic.test.ts` | semantic documents + vectors (M16) discards stale vector rows whose contentHash no longer matches | **PASSED** |
| `src/lib/search/semantic.test.ts` | semantic documents + vectors (M16) discards unknown canonical ids | **PASSED** |
| `src/lib/search/semantic.test.ts` | semantic documents + vectors (M16) fails closed when the vector provider fails | **PASSED** |
| `src/lib/search/semantic.test.ts` | retrieveEvidence orchestration (M16) keeps strong deterministic matches without invoking semantic noise | **PASSED** |
| `src/lib/search/semantic.test.ts` | retrieveEvidence orchestration (M16) appends semantic hits when deterministic results are insufficient | **PASSED** |
| `src/lib/search/semantic.test.ts` | retrieveEvidence orchestration (M16) falls back to deterministic-only when semantic infrastructure fails | **PASSED** |
| `src/lib/search/semantic.test.ts` | retrieveEvidence orchestration (M16) preserves LIMITED_EVIDENCE through semantic rehydration | **PASSED** |
| `src/lib/security/security.test.ts` | content security policy (M24) drops unsafe-eval and websocket connects in production | **PASSED** |
| `src/lib/security/security.test.ts` | content security policy (M24) locks down objects, frames, media, and base URIs | **PASSED** |
| `src/lib/security/security.test.ts` | content security policy (M24) keeps the app same-origin — no third-party connect or script hosts | **PASSED** |
| `src/lib/security/security.test.ts` | security headers (M24) emits the full production header set | **PASSED** |
| `src/lib/security/security.test.ts` | security headers (M24) emits HSTS only for a configured https origin | **PASSED** |
| `src/lib/security/security.test.ts` | security headers (M24) denies sensor and capture permissions | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) treats a missing or foreign Origin as cross-origin | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) matches Origin against the Host header, not the internal request URL | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) accepts the browser's own same-origin declaration | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) refuses a sibling subdomain and an unparseable Origin | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) detects control characters but allows ordinary text | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) stops reading a body once the ceiling is passed | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) enforces the ceiling on a stream that declares no length | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) reassembles a multi-chunk body under the ceiling | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) names the reason for every rejection | **PASSED** |
| `src/lib/security/security.test.ts` | request guard (M24) passes a well-formed same-origin query through untouched | **PASSED** |
| `src/lib/security/security.test.ts` | rate limiter (M24) allows up to the cap then refuses within the window | **PASSED** |
| `src/lib/security/security.test.ts` | rate limiter (M24) reopens on the next window | **PASSED** |
| `src/lib/security/security.test.ts` | rate limiter (M24) derives no visitor key — the window is shared by construction | **PASSED** |
| `src/lib/seo/seo.test.ts` | indexing policy (M24) never lists a route as both indexable and noindex | **PASSED** |
| `src/lib/seo/seo.test.ts` | indexing policy (M24) classifies every page in the app — no route silently unlisted | **PASSED** |
| `src/lib/seo/seo.test.ts` | indexing policy (M24) marks session-shaped pages noindex but still followable-free | **PASSED** |
| `src/lib/seo/seo.test.ts` | site origin (M24) stays relative until an origin is configured | **PASSED** |
| `src/lib/seo/seo.test.ts` | site origin (M24) strips a trailing slash so URLs never double up | **PASSED** |
| `src/lib/seo/seo.test.ts` | sitemap (M24) lists every indexable route and every project detail page | **PASSED** |
| `src/lib/seo/seo.test.ts` | sitemap (M24) excludes session-shaped surfaces and the machine-readable routes | **PASSED** |
| `src/lib/seo/seo.test.ts` | sitemap (M24) ranks the recruiter path above the rest | **PASSED** |
| `src/lib/seo/seo.test.ts` | sitemap (M24) emits absolute URLs once an origin exists | **PASSED** |
| `src/lib/seo/seo.test.ts` | robots (M24) disallows session surfaces and the API, and allows the rest | **PASSED** |
| `src/lib/seo/seo.test.ts` | robots (M24) omits host and sitemap until an origin is configured | **PASSED** |
| `src/lib/seo/seo.test.ts` | robots (M24) points at the sitemap once an origin is configured | **PASSED** |
| `src/lib/steward/scenarios.test.ts` | steward scenarios (M12) defines the four handoff scenarios | **PASSED** |
| `src/lib/steward/scenarios.test.ts` | steward scenarios (M12) parses scenario ids and falls back on invalid input | **PASSED** |
| `src/lib/steward/scenarios.test.ts` | steward scenarios (M12) keeps baseline deterministic with withheld advice and dry-run Task | **PASSED** |
| `src/lib/steward/scenarios.test.ts` | steward scenarios (M12) marks missing renal context as warning and blocks recommendation | **PASSED** |
| `src/lib/steward/scenarios.test.ts` | steward scenarios (M12) surfaces allergy conflict as warning without treatment advice | **PASSED** |
| `src/lib/steward/scenarios.test.ts` | steward scenarios (M12) fails closed on invalid tool input with error states | **PASSED** |
| `src/lib/steward/scenarios.test.ts` | steward scenarios (M12) never claims live FHIR, Gemini, or MCP runtime in boundary copy | **PASSED** |
| `src/lib/signal/compose.test.ts` | ui_plan validation (M18) accepts a minimal GapNotice plan | **PASSED** |
| `src/lib/signal/compose.test.ts` | ui_plan validation (M18) rejects unknown component types | **PASSED** |
| `src/lib/signal/compose.test.ts` | ui_plan validation (M18) rejects plans that smuggle factual title fields | **PASSED** |
| `src/lib/signal/compose.test.ts` | ui_plan validation (M18) rejects Comparison with fewer than two evidence ids | **PASSED** |
| `src/lib/signal/compose.test.ts` | ui_plan validation (M18) rejects empty blocks array | **PASSED** |
| `src/lib/signal/compose.test.ts` | compose rehydration (M18) composes a view from cardstack evidence with graph-backed titles | **PASSED** |
| `src/lib/signal/compose.test.ts` | compose rehydration (M18) returns gap compose for nonsense queries | **PASSED** |
| `src/lib/signal/compose.test.ts` | compose rehydration (M18) falls back entirely when plan references unknown project id | **PASSED** |
| `src/lib/signal/compose.test.ts` | compose rehydration (M18) falls back when ArchitectureStrip targets a non-MLOps project | **PASSED** |
| `src/lib/signal/compose.test.ts` | compose rehydration (M18) never upgrades LIMITED_EVIDENCE through composition | **PASSED** |
| `src/lib/signal/compose.test.ts` | compose rehydration (M18) planUiFromEvidence emits only allowlisted component types | **PASSED** |
| `src/lib/signal/signal.test.ts` | Signal tool session + allowlist (M17) exposes only the five allowlisted tool names | **PASSED** |
| `src/lib/signal/signal.test.ts` | Signal tool session + allowlist (M17) rejects fetch_evidence for ids not exposed by earlier tools | **PASSED** |
| `src/lib/signal/signal.test.ts` | Signal tool session + allowlist (M17) rejects fetch_project without prior exposure | **PASSED** |
| `src/lib/signal/signal.test.ts` | Signal tool session + allowlist (M17) rejects fetch_sources without prior exposure | **PASSED** |
| `src/lib/signal/signal.test.ts` | Signal tool session + allowlist (M17) search_evidence exposes ids so fetch_evidence succeeds | **PASSED** |
| `src/lib/signal/signal.test.ts` | Signal tool session + allowlist (M17) compare_evidence requires at least two exposed ids | **PASSED** |
| `src/lib/signal/signal.test.ts` | Signal tool session + allowlist (M17) compare_evidence refuses unexposed ids even when length ≥ 2 | **PASSED** |
| `src/lib/signal/signal.test.ts` | interpretWithSignal orchestrator (M17) returns a deterministic gap notice when nothing matches | **PASSED** |
| `src/lib/signal/signal.test.ts` | interpretWithSignal orchestrator (M17) returns gap notice for empty query | **PASSED** |
| `src/lib/signal/signal.test.ts` | interpretWithSignal orchestrator (M17) assembles a tool-backed answer with evidence ids for known queries | **PASSED** |
| `src/lib/signal/signal.test.ts` | interpretWithSignal orchestrator (M17) never upgrades LIMITED_EVIDENCE on SHAP-related interpretation | **PASSED** |
| `src/lib/signal/signal.test.ts` | interpretWithSignal orchestrator (M17) does not invent evidence ids outside the search index | **PASSED** |
| `src/lib/signal/signal.test.ts` | interpretWithSignal orchestrator (M17) tool trace stays within the allowlist | **PASSED** |
| `src/lib/session/session.test.ts` | session distinct events (M19) collapses repeated clicks on the same item | **PASSED** |
| `src/lib/session/session.test.ts` | evaluateSessionSignal (M19) does not detect below interaction threshold | **PASSED** |
| `src/lib/session/session.test.ts` | evaluateSessionSignal (M19) rejects when repeated clicks fake volume without distinct support | **PASSED** |
| `src/lib/session/session.test.ts` | evaluateSessionSignal (M19) detects a clear ML ENGINEERING lean with ≥60% share | **PASSED** |
| `src/lib/session/session.test.ts` | evaluateSessionSignal (M19) rejects a balanced split without a 60% winner | **PASSED** |
| `src/lib/session/session.test.ts` | orderProjectsByCategory (M19) prioritizes MLOps first for ML ENGINEERING without dropping projects | **PASSED** |
| `src/lib/session/session.test.ts` | orderProjectsByCategory (M19) returns original order when no category is active | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) exposes exactly the five handoff layers in order | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) labels every subsystem with an allowed reality label | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) points every subsystem at a path that exists in this repository | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) never presents a lab as real production runtime | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) marks the hosted LLM as an optional provider, not real runtime | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) keeps graph validation a build-time system | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) rejects an unknown layer id | **PASSED** |
| `src/lib/surface/surface.test.ts` | Under the Surface layers (M22) counts subsystems across all four reality labels | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) builds a labelled entry from safe fields | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) rejects a raw Signal query | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) rejects raw pasted job description text | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) rejects prompts, model reasoning, and IP address fields | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) rejects an unknown action or status | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) names the field it refused so a rejection is explainable | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) refuses anything that is not a plain object | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) rejects malformed values in otherwise allowed fields | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) accepts the edges the contract does allow | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) keeps the allowlist and the accepted fields in step | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) defaults missing telemetry to null rather than zero | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) bounds history to the last RUNTIME_TRACE_LIMIT actions | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) says NOT MEASURED / NOT COLLECTED instead of inventing numbers | **PASSED** |
| `src/lib/surface/surface.test.ts` | Runtime trace safety (M22) declares what is never recorded | **PASSED** |
| `src/lib/visual/tokens.test.ts` | M3 visual contracts defines required semantic token names in globals.css | **PASSED** |
| `src/lib/visual/tokens.test.ts` | M3 visual contracts defines evidence-state token stems for every badge state family | **PASSED** |
| `src/lib/visual/tokens.test.ts` | M3 visual contracts keeps TOKEN_HEX in sync with :root hex values in globals.css | **PASSED** |
| `src/lib/visual/tokens.test.ts` | M3 visual contracts keeps critical colour pairs above WCAG AA text contrast | **PASSED** |
| `src/lib/visual/tokens.test.ts` | M3 visual contracts includes a11y media baselines and focus/print chrome contracts | **PASSED** |
| `src/lib/visual/tokens.test.ts` | M3 visual contracts does not introduce purple/neon-style hex accents in token sheet | **PASSED** |
| `src/lib/visual/tokens.test.ts` | M3 visual contracts references no custom property it never defines | **PASSED** |
| `src/lib/xray/layers.test.ts` | Project X-Ray layers (M11) defines four responsibility layers with graph-backed components | **PASSED** |
| `src/lib/xray/layers.test.ts` | Project X-Ray layers (M11) resolves detection components to drift.py and stats.py | **PASSED** |
| `src/lib/xray/layers.test.ts` | Project X-Ray layers (M11) rejects invented Redis/MLflow vocabulary in layer copy | **PASSED** |
| `src/lib/xray/layers.test.ts` | Project X-Ray layers (M11) finds components and related labels | **PASSED** |
| `src/lib/xray/layers.test.ts` | Project X-Ray layers (M11) never claims a state stronger than the graph nodes behind its sources | **PASSED** |
| `src/components/architecture/reversible-architecture.test.tsx` | ReversibleArchitecture (M9) labels reconstruction and starts at System Boundary with portfolio honesty | **PASSED** |
| `src/components/architecture/reversible-architecture.test.tsx` | ReversibleArchitecture (M9) advances with Next and scrubber, and opens Source Trace on detection | **PASSED** |
| `src/components/architecture/reversible-architecture.test.tsx` | ReversibleArchitecture (M9) keeps cumulative map as text and does not invent uptime/fps | **PASSED** |
| `src/components/architecture/reversible-architecture.test.tsx` | ReversibleArchitecture (M9) Previous stays disabled on first stage | **PASSED** |
| `src/components/autopsy/project-autopsy.test.tsx` | ProjectAutopsy (M10) defaults to STORY and lists all six lenses | **PASSED** |
| `src/components/autopsy/project-autopsy.test.tsx` | ProjectAutopsy (M10) preserves RUN panel state when switching lenses (keep-mounted) | **PASSED** |
| `src/components/autopsy/project-autopsy.test.tsx` | ProjectAutopsy (M10) shows empty FAILURES museum without fabricated exhibits | **PASSED** |
| `src/components/autopsy/project-autopsy.test.tsx` | ProjectAutopsy (M10) opens Source Trace from a DECISIONS claim | **PASSED** |
| `src/components/autopsy/project-autopsy.test.tsx` | ProjectAutopsy (M10) moves lens selection with Arrow keys (APG tablist) | **PASSED** |
| `src/components/autopsy/project-autopsy.test.tsx` | ProjectAutopsy (M10) opens X-RAY lens from #project-xray / #reversible-architecture hash | **PASSED** |
| `src/components/ending/ending-signal-view.test.tsx` | EndingSignalView (M23) keeps an inactive session shallow and says so | **PASSED** |
| `src/components/ending/ending-signal-view.test.tsx` | EndingSignalView (M23) always states that the signal describes the session, not the person | **PASSED** |
| `src/components/ending/ending-signal-view.test.tsx` | EndingSignalView (M23) replays the canonical route in visit order | **PASSED** |
| `src/components/ending/ending-signal-view.test.tsx` | EndingSignalView (M23) lists a completed challenge separately from runtime actions | **PASSED** |
| `src/components/ending/ending-signal-view.test.tsx` | EndingSignalView (M23) explains provenance and exclusions behind WHY THIS SIGNAL? | **PASSED** |
| `src/components/ending/ending-signal-view.test.tsx` | EndingSignalView (M23) publishes the journey integrity manifest with zeroed tracking | **PASSED** |
| `src/components/ending/ending-signal-view.test.tsx` | EndingSignalView (M23) closes on the human with conventional contact actions | **PASSED** |
| `src/components/failures/failure-museum.test.tsx` | FailureMuseum (M14) renders empty museum with gate requirements and zero published count | **PASSED** |
| `src/components/failures/failure-museum.test.tsx` | FailureMuseum (M14) links to /failures when used as an embedded surface | **PASSED** |
| `src/components/failures/failure-museum.test.tsx` | FailureMuseum (M14) renders published exhibits when the museum view is non-empty | **PASSED** |
| `src/components/fork/fork-anish.test.tsx` | ForkAnish UI (M20) forks a sample JD into a temporary branch with integrity manifest | **PASSED** |
| `src/components/fork/fork-anish.test.tsx` | ForkAnish UI (M20) shows an error when forking an empty JD | **PASSED** |
| `src/components/fork/fork-anish.test.tsx` | ForkAnish UI (M20) puts nothing derived from the pasted JD into the session trace | **PASSED** |
| `src/components/interview/interview-my-work.test.tsx` | InterviewMyWork (M21) shows the entry line and generates nothing before a trail exists | **PASSED** |
| `src/components/interview/interview-my-work.test.tsx` | InterviewMyWork (M21) builds at most three evidence-bound questions from the trail | **PASSED** |
| `src/components/interview/interview-my-work.test.tsx` | InterviewMyWork (M21) reveals matched triggers and source counts only on WHY THIS QUESTION? | **PASSED** |
| `src/components/interview/interview-my-work.test.tsx` | InterviewMyWork (M21) always shows the answer-key boundary and never a score | **PASSED** |
| `src/components/interview/interview-my-work.test.tsx` | InterviewMyWork (M21) clears the set on demand | **PASSED** |
| `src/components/labs/malware-lab.test.tsx` | MalwareLab (M13) shows PORTFOLIO_EXTENSION boundary and static feature controls | **PASSED** |
| `src/components/labs/malware-lab.test.tsx` | MalwareLab (M13) keeps SHAP detail LIMITED and withholds security verdict copy | **PASSED** |
| `src/components/labs/malware-lab.test.tsx` | MalwareLab (M13) pins default study signal and updates contributions when toggled | **PASSED** |
| `src/components/labs/malware-lab.test.tsx` | MalwareLab (M13) resets to default features | **PASSED** |
| `src/components/labs/malware-lab.test.tsx` | MalwareLab (M13) opens Source Trace for the public report with SHA fingerprint | **PASSED** |
| `src/components/labs/malware-lab.test.tsx` | MalwareLab (M13) opens Source Trace for the SHAP boundary | **PASSED** |
| `src/components/labs/malware-lab.test.tsx` | MalwareLab (M13) links GitHub report through the pinned commit SHA | **PASSED** |
| `src/components/labs/mlops-lab.test.tsx` | MlopsLab (M6+M7) shows PORTFOLIO_EXTENSION boundary and Source Trace | **PASSED** |
| `src/components/labs/mlops-lab.test.tsx` | MlopsLab (M6+M7) exposes BREAK, SHIFT, INJECT, RESET and an accessible histogram table | **PASSED** |
| `src/components/labs/mlops-lab.test.tsx` | MlopsLab (M6+M7) BREAK THE SYSTEM opens Watch Anish Debug and a labeled event trace | **PASSED** |
| `src/components/labs/mlops-lab.test.tsx` | MlopsLab (M6+M7) RECOVER returns to healthy baseline after a break | **PASSED** |
| `src/components/labs/mlops-lab.test.tsx` | MlopsLab (M6+M7) opens Source Trace drawer for PSI with SHA fingerprint | **PASSED** |
| `src/components/labs/steward-lab.test.tsx` | StewardLab (M12) shows PORTFOLIO_EXTENSION boundary and scenario controls | **PASSED** |
| `src/components/labs/steward-lab.test.tsx` | StewardLab (M12) switches to allergy conflict and keeps advice withheld | **PASSED** |
| `src/components/labs/steward-lab.test.tsx` | StewardLab (M12) shows dry-run Task preview only on baseline | **PASSED** |
| `src/components/labs/steward-lab.test.tsx` | StewardLab (M12) opens Source Trace for MCP server with SHA fingerprint | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) opens a diagnostic search dialog that is not chat-like | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) lists ranked hits with honest evidence badges | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) shows semantic relevance when deterministic matches are insufficient | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) shows a gap notice when nothing matches | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) keeps LIMITED_EVIDENCE visible for SHAP matches | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) closes on Escape | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) toggles open with Ctrl+K | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) exposes INTERPRET WITH SIGNAL only after a query is entered | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) runs Signal interpretation via API and shows composed UI | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) shows Signal gap notice when API returns no evidence | **PASSED** |
| `src/components/search/ask-runtime.test.tsx` | AskRuntime (M15–M17) shows full fallback notice when composeStatus is fallback | **PASSED** |
| `src/components/session/recompile-banner.test.tsx` | RecompileBanner (M19) stays hidden until the heuristic detects a lean | **PASSED** |
| `src/components/session/recompile-banner.test.tsx` | RecompileBanner (M19) requires explicit RECOMPILE consent and allows RESET | **PASSED** |
| `src/components/session/recompile-banner.test.tsx` | RecompileBanner (M19) NOT NOW dismisses without changing evidence presentation category | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) shows the entry line and all five layers | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) labels labs as portfolio simulation, never real runtime | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) filters subsystems by reality label | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) starts with an empty trace and records safe fields only | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) shows NOT MEASURED and NOT COLLECTED instead of fabricated numbers | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) counts rejected unsafe entries without rendering them | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) clears the trace on demand | **PASSED** |
| `src/components/surface/under-the-surface.test.tsx` | UnderTheSurface (M22) declares what is never recorded | **PASSED** |
| `src/components/source-trace/source-trace-drawer.test.tsx` | SourceTrace drawer opens authoritative panel with SHA fingerprint and closes on Escape | **PASSED** |
| `src/components/source-trace/source-trace-drawer.test.tsx` | SourceTrace drawer closes via Close button | **PASSED** |
| `src/components/source-trace/source-trace-drawer.test.tsx` | SourceTrace drawer restores focus to the Trace trigger after Close | **PASSED** |
| `src/components/source-trace/source-trace-drawer.test.tsx` | SourceTrace drawer does not stack drawers when SourceTraceProvider is nested | **PASSED** |
| `src/components/xray/project-xray.test.tsx` | ProjectXray (M11) lists layers and selects a component with related + Trace | **PASSED** |
| `src/components/xray/project-xray.test.tsx` | ProjectXray (M11) isolates a layer and dims others in the semantic list | **PASSED** |
| `src/app/labs/malware/page.test.tsx` | MalwareLabPage (M13) frames the lab as optional and links back to malware Autopsy | **PASSED** |
| `src/app/labs/steward/page.test.tsx` | StewardLabPage (M12) frames the lab as optional and links back to Steward Autopsy | **PASSED** |
| `src/app/labs/mlops/page.test.tsx` | MlopsLabPage (M6) frames the lab as optional and links back to project evidence | **PASSED** |
| `src/app/work/[slug]/page.test.tsx` | ProjectPage — weak evidence honesty surfaces PORTFOLIO EXTENSION via Autopsy RUN / story path on MLOps | **PASSED** |
| `src/app/work/[slug]/page.test.tsx` | ProjectPage — weak evidence honesty surfaces LIMITED EVIDENCE on the malware SHAP path | **PASSED** |
| `src/app/work/[slug]/page.test.tsx` | ProjectPage — weak evidence honesty exposes Source Trace triggers on the EVIDENCE lens | **PASSED** |
| `src/app/work/[slug]/page.test.tsx` | ProjectPage — weak evidence honesty surfaces Project X-Ray and Reversible Architecture on the X-RAY lens | **PASSED** |
| `src/app/work/[slug]/page.test.tsx` | ProjectPage — weak evidence honesty surfaces Malware Autopsy RUN with Explainability Lab honesty | **PASSED** |
| `src/app/work/[slug]/page.test.tsx` | ProjectPage — weak evidence honesty surfaces Steward Autopsy RUN with Agent Lab honesty | **PASSED** |
| `src/app/api/signal/interpret/route.rate-limit.test.ts` | Signal rate limit at the route (M24) serves the window, then refuses with 429 and a Retry-After | **PASSED** |
| `src/app/api/signal/interpret/route.rate-limit.test.ts` | Signal rate limit at the route (M24) rate limits before reading the body, so a refusal costs nothing | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) rejects invalid JSON | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) rejects oversized queries | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) rejects cross-origin and origin-less callers | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) rejects non-JSON media types | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) rejects bodies over the byte ceiling | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) rejects non-string and control-character queries | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) answers an empty or whitespace query with a gap, not a guess | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) never caches interpretations | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) returns a tool-orchestrated gap for nonsense | **PASSED** |
| `src/app/api/signal/interpret/route.test.ts` | POST /api/signal/interpret (M17 + M24 bounds) returns evidence for a known query without inventing states | **PASSED** |

## Failures

_None._

## Commands

```bash
pnpm test          # unit only
pnpm test:status   # unit + refresh this file
pnpm test:e2e      # Playwright against the dev server
pnpm test:e2e:prod # Playwright against a production build (headers, CSP, noindex)
```
