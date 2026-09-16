/**
 * Re-checks that every source the site cites as proof still resolves.
 *
 * Network-dependent, so it is deliberately not part of `pnpm ci` — a flaky
 * network must not fail an otherwise correct build. Run it on a schedule, and
 * before publishing anything that leans on the provenance.
 */
import { loadEvidenceGraph } from "../src/lib/evidence/load-graph";
import { urlMatchesPin, verifySources } from "../src/lib/sources/verify";

const TIMEOUT_MS = 15_000;

async function head(url: string) {
  const response = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { ok: response.ok, status: response.status };
}

async function main() {
  const graph = loadEvidenceGraph();

  const drifted = graph.sources.filter((source) => !urlMatchesPin(source));
  for (const source of drifted) {
    console.error(`X ${source.id} — URL does not contain its claimed commit`);
  }

  const result = await verifySources(graph.sources, head);
  for (const check of result.checks) {
    const mark =
      check.status === "reachable" ? "." : check.status === "exempt" ? "-" : "X";
    console.log(`${mark} ${check.id.padEnd(34)} ${check.detail}`);
  }

  const failed = result.failures.length + drifted.length;
  console.log(
    `\n${result.checked - result.failures.length}/${result.checked} sources reachable` +
      ` (${result.exempt} exempt by design).`,
  );

  if (failed > 0) {
    console.error(
      `\n${failed} provenance failure(s). The site cites these as proof, so either the` +
        ` source moved — re-pin it through change control — or the claim must go.`,
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
