/**
 * M24 asset measurement.
 *
 * Next's build output no longer prints per-route sizes, so measure them from the
 * prerendered HTML: every `/_next/static/**.js` a route requests on first paint,
 * summed as gzip bytes. That is the JavaScript a visitor actually pays for.
 * Budgets fail CI on regression; raise one only with a measured reason.
 */

import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

const NEXT_DIR = ".next";
const APP_DIR = join(NEXT_DIR, "server", "app");

/**
 * Ceilings sit ~6% above the measured value at M24 lock, so a regression trips
 * the build rather than drifting quietly. About 126 KB of every number below is
 * the React + Next runtime floor; the portfolio's own code is the remainder.
 */
const EXACT_BUDGETS_KB = {
  "/": 156,
  "/work": 155,
  "/cv": 154,
  "/about": 154,
  "/contact": 154,
  "/experience": 154,
  "/failures": 154,
};

const PREFIX_BUDGETS_KB = [
  ["/work/", 174],
  ["/labs/", 165],
];

const DEFAULT_BUDGET_KB = 158;

function budgetFor(route) {
  if (route in EXACT_BUDGETS_KB) return EXACT_BUDGETS_KB[route];
  for (const [prefix, kb] of PREFIX_BUDGETS_KB) {
    if (route.startsWith(prefix)) return kb;
  }
  return DEFAULT_BUDGET_KB;
}

function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...htmlFiles(path));
    else if (entry.name.endsWith(".html")) found.push(path);
  }
  return found;
}

function routeFor(file) {
  const rel = relative(APP_DIR, file).split(sep).join(posix.sep);
  const withoutExt = rel.slice(0, -".html".length);
  if (withoutExt === "index") return "/";
  return `/${withoutExt}`;
}

if (!existsSync(APP_DIR)) {
  console.error(`Bundle budget: ${APP_DIR} missing — run \`pnpm build\` first.`);
  process.exit(1);
}

/**
 * Server-only libraries that must never reach a browser. Zod is the live risk:
 * it is the validation authority on the server, and one stray shared import puts
 * ~24 KB gzip into every page. The budget alone would catch the weight but not
 * name the cause, so the marker scan says which route pulled it in.
 */
const FORBIDDEN_CLIENT_MODULES = [{ label: "zod", marker: "ZodError" }];

const gzipCache = new Map();
const forbiddenCache = new Map();

function forbiddenModulesIn(assetPath) {
  if (forbiddenCache.has(assetPath)) return forbiddenCache.get(assetPath);
  const file = join(NEXT_DIR, decodeURIComponent(assetPath).replace("/_next/", ""));
  const source = readFileSync(file, "utf8");
  const found = FORBIDDEN_CLIENT_MODULES.filter((m) => source.includes(m.marker)).map(
    (m) => m.label,
  );
  forbiddenCache.set(assetPath, found);
  return found;
}

function gzipBytes(assetPath) {
  if (gzipCache.has(assetPath)) return gzipCache.get(assetPath);
  // Dynamic segments are percent-encoded in the HTML (`%5Bslug%5D`).
  const file = join(NEXT_DIR, decodeURIComponent(assetPath).replace("/_next/", ""));
  if (!existsSync(file) || !statSync(file).isFile()) {
    // Silently counting a missing chunk as 0 would understate the budget.
    console.error(`Bundle budget: referenced asset not found on disk — ${assetPath}`);
    process.exit(1);
  }
  const size = gzipSync(readFileSync(file)).byteLength;
  gzipCache.set(assetPath, size);
  return size;
}

const rows = [];
const leaks = [];
let failed = false;

for (const file of htmlFiles(APP_DIR)) {
  const route = routeFor(file);
  if (route.startsWith("/_")) continue; // internal error/not-found shells

  const html = readFileSync(file, "utf8");
  const assets = new Set(
    [...html.matchAll(/["'](\/_next\/static\/[^"']+\.js)["']/g)]
      .map((m) => m[1])
      // Served `nomodule`; modern browsers never download it, so counting it
      // would measure a cost no real visitor pays.
      .filter((asset) => !asset.includes("/polyfills-")),
  );

  const bytes = [...assets].reduce((sum, asset) => sum + gzipBytes(asset), 0);
  const kb = Math.round((bytes / 1024) * 10) / 10;
  const budget = budgetFor(route);
  const over = kb > budget;
  if (over) failed = true;
  rows.push({ route, kb, budget, chunks: assets.size, over });

  for (const asset of assets) {
    for (const label of forbiddenModulesIn(asset)) {
      failed = true;
      leaks.push(`${route} ships server-only "${label}" via ${asset}`);
    }
  }
}

rows.sort((a, b) => b.kb - a.kb);
for (const row of rows) {
  console.log(
    `${row.over ? "x" : "."} ${row.route.padEnd(42)} ${String(row.kb).padStart(7)} KB / ${row.budget} KB  (${row.chunks} chunks)`,
  );
}

if (leaks.length > 0) {
  console.error("\nServer-only code reached the client bundle:");
  for (const leak of [...new Set(leaks)]) console.error(`  - ${leak}`);
  console.error("Move the shared value into a dependency-free module.");
}

if (failed) {
  if (leaks.length === 0) {
    console.error("\nBundle budget exceeded — split the route or justify a new ceiling.");
  }
  process.exit(1);
}

console.log(
  `\nBundle budget OK (${rows.length} routes measured, gzip first-load JS, ` +
    `${FORBIDDEN_CLIENT_MODULES.length} server-only module(s) verified absent)`,
);
