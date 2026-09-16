import { defineConfig, devices } from "@playwright/test";

/**
 * M0 Playwright matrix scaffold — desktop + mobile.
 * Expand coverage in later milestones; keep smoke-only here.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // E2E_PROD runs the suite against a real production build, which is the only
    // way the CSP, security headers, and noindex policy can be asserted (M24).
    command: process.env.E2E_PROD || process.env.CI ? "pnpm start" : "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
  ],
});
