/**
 * Issue-filing for the weekly `verify:sources` run.
 *
 * Lives here rather than inline in the workflow because this code only ever
 * executes when the proof trail is already broken — the one moment it has to
 * work. Inline in YAML it was unreachable by any test; here it is covered by
 * `provenance-issue.test.ts`.
 */

export const TITLE = "Provenance failure: a cited source no longer resolves";

/** GitHub rejects bodies over 65536 chars; stay well under and keep the tail. */
export const MAX_OUTPUT_CHARS = 8000;

export const LABEL = "provenance";

export function buildIssueBody(output, runUrl) {
  return [
    "`pnpm verify:sources` failed, so the site is citing at least one source",
    "that no longer resolves. Visitors following the proof trail hit a dead link.",
    "",
    "Either re-pin the source through change control, or remove the claim that",
    "depends on it. Do not silently drop the link — the claim is what the link",
    "was supporting.",
    "",
    "```",
    output,
    "```",
    "",
    `[Run](${runUrl})`,
  ].join("\n");
}

/**
 * Files one issue for a broken proof trail, or does nothing if an open one is
 * already tracking it.
 *
 * @returns {Promise<"created" | "already-open">} what it did, so the caller
 *   (and the tests) can tell the two apart rather than inferring from silence.
 */
export async function reportProvenanceFailure({ github, context, readOutput }) {
  let output;
  try {
    output = readOutput();
  } catch {
    // A missing log must not swallow the alert — the failure is the point, the
    // log is only the detail.
    output = "(no output captured)";
  }
  if (!output || !output.trim()) output = "(no output captured)";
  output = output.slice(-MAX_OUTPUT_CHARS);

  const { owner, repo } = context.repo;

  // Scoped to open issues on purpose: once the owner closes one, a later
  // breakage should raise a new issue rather than be silently swallowed.
  const existing = await github.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    labels: LABEL,
  });
  if (existing.data.some((issue) => issue.title === TITLE)) {
    return "already-open";
  }

  await github.rest.issues.create({
    owner,
    repo,
    title: TITLE,
    labels: [LABEL],
    body: buildIssueBody(
      output,
      `${context.serverUrl}/${owner}/${repo}/actions/runs/${context.runId}`,
    ),
  });
  return "created";
}
