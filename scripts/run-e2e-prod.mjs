/**
 * Run the Playwright suite against a production server (M24).
 * A wrapper rather than inline env assignment so the command behaves identically
 * on Windows and CI without adding a dependency. Playwright's CLI is resolved and
 * run through this Node binary, avoiding shell-specific `.cmd` spawning.
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const cli = require.resolve("@playwright/test/cli");

const child = spawn(process.execPath, [cli, "test", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, E2E_PROD: "1" },
});

child.on("exit", (code) => process.exit(code ?? 1));
