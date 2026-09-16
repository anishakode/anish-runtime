/**
 * Runs unit tests and writes a human-readable status report.
 * Exit code mirrors Vitest (non-zero on failure).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "testing");
const jsonPath = join(outDir, ".vitest-last.json");
const statusPath = join(outDir, "TEST-STATUS.md");
const catalogPath = join(outDir, "TEST-CATALOG.md");

mkdirSync(outDir, { recursive: true });

const run = spawnSync(
  "pnpm",
  [
    "exec",
    "vitest",
    "run",
    "--reporter=json",
    "--reporter=default",
    `--outputFile=${jsonPath}`,
  ],
  {
    cwd: root,
    shell: true,
    encoding: "utf8",
    env: process.env,
  },
);

if (run.stdout) process.stdout.write(run.stdout);
if (run.stderr) process.stderr.write(run.stderr);

/** @type {{ success?: boolean, numTotalTests?: number, numPassedTests?: number, numFailedTests?: number, numPendingTests?: number, startTime?: number, testResults?: Array<{ name: string, status: string, assertionResults?: Array<{ title: string, fullName: string, status: string, failureMessages?: string[] }> }> }} */
let report = {};
if (existsSync(jsonPath)) {
  try {
    report = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch {
    report = {};
  }
}

const generatedAt = new Date().toISOString();
const total = report.numTotalTests ?? 0;
const passed = report.numPassedTests ?? 0;
const failed = report.numFailedTests ?? 0;
const pending = report.numPendingTests ?? 0;
const ok = failed === 0 && (run.status === 0 || run.status === null);

const rows = [];
for (const file of report.testResults ?? []) {
  const fileName = file.name?.replace(/\\/g, "/") ?? "unknown";
  const short = fileName.includes("/src/")
    ? fileName.slice(fileName.indexOf("/src/") + 1)
    : fileName.split("/").slice(-2).join("/");
  for (const t of file.assertionResults ?? []) {
    const status = (t.status ?? "unknown").toUpperCase();
    rows.push(`| \`${short}\` | ${t.fullName ?? t.title} | **${status}** |`);
  }
}

const catalogNote = existsSync(catalogPath)
  ? "See also [`TEST-CATALOG.md`](./TEST-CATALOG.md) for what each suite is meant to protect."
  : "";

const md = `# Test status (unit)

**Generated:** ${generatedAt}  
**Result:** ${ok ? "PASS" : "FAIL"}  
**Counts:** ${passed} passed · ${failed} failed · ${pending} pending · ${total} total

${catalogNote}

> E2e is separate from this file. CI and \`pnpm ci:full\` run it against a production build (\`pnpm test:e2e:prod\`), which is the only way the CSP, security headers, and noindex policy are asserted. Plain \`pnpm ci\` stops at the bundle budget; record e2e results manually after a local run.

## Last unit run

| File | Test | Status |
|------|------|--------|
${rows.length > 0 ? rows.join("\n") : "| — | No vitest JSON parsed | **UNKNOWN** |"}

## Failures

${
  failed === 0
    ? "_None._"
    : (report.testResults ?? [])
        .flatMap((file) =>
          (file.assertionResults ?? [])
            .filter((t) => t.status === "failed")
            .map(
              (t) =>
                `### ${t.fullName ?? t.title}\n\n\`\`\`\n${(t.failureMessages ?? []).join("\n")}\n\`\`\`\n`,
            ),
        )
        .join("\n") || "_Failed tests present but messages unavailable._"
}

## Commands

\`\`\`bash
pnpm test          # unit only
pnpm test:status   # unit + refresh this file
pnpm test:e2e      # Playwright against the dev server
pnpm test:e2e:prod # Playwright against a production build (headers, CSP, noindex)
\`\`\`
`;

writeFileSync(statusPath, md, "utf8");
console.log(`\nWrote ${statusPath.replace(root + "\\", "").replace(root + "/", "")}`);

process.exit(typeof run.status === "number" ? run.status : ok ? 0 : 1);
