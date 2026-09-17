import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * M24 production audit.
 * These run against whatever server Playwright started; header and CSP
 * assertions are skipped on the dev server, which relaxes both by design.
 */

const PUBLIC_ROUTES = [
  "/",
  "/work",
  "/experience",
  "/about",
  "/cv",
  "/contact",
  "/failures",
  "/labs",
  "/labs/mlops",
  "/labs/steward",
  "/labs/malware",
  "/fork",
  "/interview",
  "/surface",
  "/ending",
  "/work/mlops-governance-dashboard",
];

const NOINDEX_ROUTES = ["/ending", "/surface", "/fork", "/interview"];
const isProd = !!process.env.E2E_PROD;
const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

test.describe("accessibility audit", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`no serious or critical axe violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        blocking.map((v) => `${v.id} (${v.impact}) — ${v.nodes.length} nodes`),
      ).toEqual([]);
    });
  }

  test("content reflows at 320px without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    for (const route of ["/", "/work", "/cv", "/labs/mlops"]) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} overflows horizontally`).toBeLessThanOrEqual(1);
    }
  });

  test("skip link is the first stop and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeVisible();
    expect(await page.evaluate(() => window.location.hash)).toBe("#main");
  });

  test("keyboard focus is never hidden behind the sticky header", async ({ page }) => {
    await page.goto("/work");
    const headerBottom = await page.evaluate(() => {
      const header = document.querySelector("header");
      if (!header) return 0;
      const style = getComputedStyle(header);
      return style.position === "sticky" || style.position === "fixed"
        ? header.getBoundingClientRect().bottom
        : 0;
    });

    for (let i = 0; i < 12; i += 1) await page.keyboard.press("Tab");

    const top = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
    });
    expect(top).toBeGreaterThanOrEqual(headerBottom - 1);
  });

  test("primary controls meet the 24px minimum target size", async ({ page }) => {
    await page.goto("/");
    const controls = page.locator(
      "main button, main a.btn-primary, main a.btn-secondary",
    );
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const box = await controls.nth(i).boundingBox();
      if (!box) continue; // hidden control
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
    }
  });

  test("forced colours keeps evidence badges legible", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/work");
    const badge = page.locator(".evidence-badge, [data-evidence-state]").first();
    await expect(badge).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("the 404 page is a real 404 and still offers the recruiter path", async ({
    page,
  }) => {
    const response = await page.goto("/no-such-route");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const label of ["Work", "Experience", "About", "CV", "Contact"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations
        .filter((v) => v.impact === "critical" || v.impact === "serious")
        .map((v) => v.id),
    ).toEqual([]);
  });

  test("an unknown project slug 404s instead of rendering an empty project", async ({
    page,
  }) => {
    const response = await page.goto("/work/no-such-project");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("print keeps the CV readable and drops site chrome", async ({ page }) => {
    await page.goto("/cv");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("header.site-chrome")).toBeHidden();
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeHidden();
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("reduced motion settles the landing without staged compilation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: /RUN ANISH/i }).click();
    await expect(page.getByText(/Motion reduced — runtime ready/i)).toBeVisible({
      timeout: 2000,
    });
    await expect(page.locator("#ready-heading")).toBeVisible();
  });
});

/**
 * Hard rule 4: Work / Experience / About / CV / Contact must work without labs or AI.
 * With JavaScript disabled, none of the client runtime exists at all — this is the
 * strictest available check that the recruiter path is server-rendered HTML.
 */
test.describe("recruiter path without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  const RECRUITER_ROUTES: [string, string][] = [
    ["/work", "Work"],
    // The labs themselves need JS, but the index that chooses between them is a
    // server-rendered list. It is in the primary nav, so it must not need JS.
    ["/labs", "Labs"],
    ["/experience", "Experience"],
    ["/about", "About"],
    ["/cv", "CV"],
    ["/contact", "Contact"],
  ];

  for (const [route, label] of RECRUITER_ROUTES) {
    test(`${route} renders and navigates without client JS`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("#main")).not.toBeEmpty();

      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    });
  }

  test("the landing states who Anish is before any script runs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#main")).not.toBeEmpty();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Work", exact: true }).first(),
    ).toBeVisible();
  });

  test("evidence states are visible without the AI layer", async ({ page }) => {
    await page.goto("/work");
    const badge = page.locator("[data-evidence-state]").first();
    await expect(badge).toBeVisible();
    await expect(badge).not.toBeEmpty();
  });

  test("contact details come through as real links", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
  });

  test("the recruiter path is complete in the server HTML itself", async ({
    request,
  }) => {
    // No browser is involved here, so nothing can hydrate it into existence.
    for (const [route] of RECRUITER_ROUTES) {
      const html = await (await request.get(route)).text();
      expect(html, `${route} has no server-rendered h1`).toMatch(/<h1[^>]*>[^<]/);
      for (const href of ["/work", "/experience", "/about", "/cv", "/contact"]) {
        expect(html, `${route} is missing the ${href} link`).toContain(`href="${href}"`);
      }
    }
    expect(await (await request.get("/contact")).text()).toContain("mailto:");
  });
});

test.describe("machine-readable surfaces", () => {
  test("evidence.json and llms.txt stay reachable and typed", async ({ request }) => {
    const evidence = await request.get("/evidence.json");
    expect(evidence.status()).toBe(200);
    expect(evidence.headers()["content-type"]).toContain("application/json");
    const graph = (await evidence.json()) as { projects: unknown[] };
    expect(Array.isArray(graph.projects)).toBe(true);
    expect(graph.projects.length).toBeGreaterThan(0);

    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    expect(llms.headers()["content-type"]).toContain("text/plain");
    expect(await llms.text()).toContain("/ending");
  });
});

test.describe("social preview (M26)", () => {
  test("the card renders as a real 1200x630 PNG", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");

    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(5_000);
    // PNG magic number, then the IHDR width/height fields.
    expect(body.subarray(0, 4).toString("hex")).toBe("89504e47");
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });

  test("the page advertises the card with its dimensions", async ({ page }) => {
    await page.goto("/");
    const image = page.locator('meta[property="og:image"]');
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute("content", /opengraph-image/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      "content",
      "1200",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });
});

test.describe("production hardening", () => {
  test.skip(!isProd, "header and CSP assertions need the production server");

  async function headersFor(page: Page, route: string) {
    const response = await page.goto(route);
    expect(response, `no response for ${route}`).not.toBeNull();
    return response!.headers();
  }

  test("serves the full security header set", async ({ page }) => {
    const headers = await headersFor(page, "/");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("production CSP drops unsafe-eval and allows no third-party origin", async ({
    page,
  }) => {
    const headers = await headersFor(page, "/");
    const csp = headers["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/https?:\/\//);
  });

  test("pages load and hydrate with no CSP violations", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (/Content Security Policy/i.test(text)) violations.push(text);
    });

    await page.goto("/");
    await page.getByRole("button", { name: /RUN ANISH/i }).click();
    await expect(page.locator("#ready-heading")).toBeVisible();
    expect(violations).toEqual([]);
  });

  test("the browser's own same-origin fetch reaches Signal", async ({ page }) => {
    await page.goto("/");
    const status = await page.evaluate(async () => {
      const res = await fetch("/api/signal/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "psi drift" }),
      });
      return res.status;
    });
    expect(status).toBe(200);
  });

  test("session-shaped surfaces are served noindex", async ({ page }) => {
    for (const route of NOINDEX_ROUTES) {
      const headers = await headersFor(page, route);
      expect(headers["x-robots-tag"], `${route} is indexable`).toContain("noindex");
    }
    const work = await headersFor(page, "/work");
    expect(work["x-robots-tag"]).toBeUndefined();
  });

  test("robots and sitemap describe the same indexing policy", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /ending");
    expect(robots).toContain("Disallow: /api/");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/work/mlops-governance-dashboard");
    expect(sitemap).not.toContain("/ending");
    expect(sitemap).not.toContain("/surface");
  });

  test("Signal API refuses cross-origin, oversized, and non-JSON callers", async ({
    request,
  }) => {
    const cross = await request.post(`${ORIGIN}/api/signal/interpret`, {
      headers: { "Content-Type": "application/json", Origin: "http://evil.test" },
      data: { query: "shap" },
    });
    expect(cross.status()).toBe(403);

    const wrongType = await request.post(`${ORIGIN}/api/signal/interpret`, {
      headers: { "Content-Type": "text/plain", Origin: ORIGIN },
      data: "query=shap",
    });
    expect(wrongType.status()).toBe(415);

    const huge = await request.post(`${ORIGIN}/api/signal/interpret`, {
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      data: { query: "x", pad: "y".repeat(6000) },
    });
    expect(huge.status()).toBe(413);

    const ok = await request.post(`${ORIGIN}/api/signal/interpret`, {
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      data: { query: "shap" },
    });
    expect(ok.status()).toBe(200);
    expect(ok.headers()["cache-control"]).toBe("no-store");
  });
});
