/**
 * Live launch verification (M26).
 *
 *   pnpm smoke:live https://example.com
 *
 * Checks the things that only become true on a real origin: HTTPS, HSTS, absolute
 * canonical and social URLs, the indexing policy, the machine-readable surfaces, and
 * the recruiter path arriving as server-rendered HTML. Everything here is a fact the
 * server states about itself — no browser, no JavaScript, no crawling.
 *
 * Handoff §45 asks for a boring launch. A boring launch is one where this exits 0.
 */

const RECRUITER_ROUTES = ["/work", "/experience", "/about", "/cv", "/contact"];
const NOINDEX_ROUTES = ["/ending", "/surface", "/fork", "/interview"];
const PUBLIC_ROUTES = ["/", ...RECRUITER_ROUTES, "/failures", "/labs/mlops"];

const args = process.argv.slice(2);
const allowHttp = args.includes("--allow-http");
const origin = (
  args.find((arg) => !arg.startsWith("--")) ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  ""
).replace(/\/$/, "");

if (!origin) {
  console.error(
    "Usage: pnpm smoke:live <origin>   e.g. pnpm smoke:live https://anish.dev",
  );
  process.exit(1);
}

const results = [];

function record(ok, label, detail = "") {
  results.push({ ok, label, detail });
  console.log(`${ok ? "." : "x"} ${label}${detail ? ` — ${detail}` : ""}`);
}

async function get(path, init) {
  const response = await fetch(`${origin}${path}`, { redirect: "manual", ...init });
  const body = response.headers.get("content-type")?.match(/text|json|xml|javascript/)
    ? await response.text()
    : "";
  return { response, body };
}

async function checkTransport() {
  // `--allow-http` exists so the whole run can be rehearsed against a local production
  // server before launch day. It never applies to a real origin: the flag has to be
  // typed, and the transport checks still report what they found.
  record(
    origin.startsWith("https://") || allowHttp,
    "origin is https",
    allowHttp && !origin.startsWith("https://") ? `${origin} (http allowed)` : origin,
  );

  const { response } = await get("/");
  const hsts = response.headers.get("strict-transport-security");
  record(
    origin.startsWith("https://") ? Boolean(hsts) : true,
    "HSTS is served on the live origin",
    hsts ?? (origin.startsWith("https://") ? "absent" : "n/a over http"),
  );

  for (const [header, expected] of [
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
  ]) {
    record(
      response.headers.get(header) === expected,
      `${header} is ${expected}`,
      response.headers.get(header) ?? "absent",
    );
  }

  const csp = response.headers.get("content-security-policy") ?? "";
  record(
    csp.length > 0 && !csp.includes("unsafe-eval"),
    "CSP served without unsafe-eval",
  );
  record(response.headers.get("x-powered-by") === null, "no x-powered-by header");
}

async function checkRoutes() {
  for (const route of PUBLIC_ROUTES) {
    const { response } = await get(route);
    record(response.status === 200, `${route} returns 200`, String(response.status));
  }

  const { response: missing } = await get("/no-such-route");
  record(missing.status === 404, "unknown route returns 404", String(missing.status));
}

async function checkRecruiterPathInHtml() {
  for (const route of RECRUITER_ROUTES) {
    const { body } = await get(route);
    const hasHeading = /<h1[^>]*>[^<]/.test(body);
    const hasNav = RECRUITER_ROUTES.every((href) => body.includes(`href="${href}"`));
    record(
      hasHeading && hasNav,
      `${route} is complete in server HTML`,
      hasHeading ? (hasNav ? "" : "nav links missing") : "no h1",
    );
  }

  const { body: contact } = await get("/contact");
  record(contact.includes("mailto:"), "contact exposes a real mailto link");
}

async function checkOrigin() {
  const { body } = await get("/");

  const canonical = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
  // Next emits the root canonical without a trailing slash.
  record(
    canonical === origin || canonical.startsWith(`${origin}/`),
    "canonical URL points at this origin",
    canonical || "absent",
  );

  const ogImage = body.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? "";
  record(
    ogImage.startsWith(`${origin}/`),
    "social card URL points at this origin",
    ogImage || "absent",
  );
  // The failure this catches: deploying without NEXT_PUBLIC_SITE_URL, which leaves
  // every absolute URL pointing at localhost.
  record(!body.includes("localhost"), "no localhost URL leaked into the page");

  const { response: card } = await get("/opengraph-image");
  record(
    card.status === 200 && (card.headers.get("content-type") ?? "").includes("image/"),
    "social card renders",
    `${card.status} ${card.headers.get("content-type") ?? ""}`,
  );
}

async function checkIndexing() {
  const { body: robots } = await get("/robots.txt");
  record(robots.includes(`${origin}/sitemap.xml`), "robots.txt points at the sitemap");
  record(
    NOINDEX_ROUTES.every((route) => robots.includes(`Disallow: ${route}`)),
    "robots.txt disallows every session-shaped route",
  );

  const { body: sitemap } = await get("/sitemap.xml");
  record(sitemap.includes(`${origin}/work`), "sitemap lists work with absolute URLs");
  record(
    NOINDEX_ROUTES.every((route) => !sitemap.includes(`${origin}${route}`)),
    "sitemap excludes every session-shaped route",
  );

  for (const route of NOINDEX_ROUTES) {
    const { response } = await get(route);
    record(
      (response.headers.get("x-robots-tag") ?? "").includes("noindex"),
      `${route} is served noindex`,
    );
  }
}

async function checkMachineReadable() {
  const { response: evidence, body } = await get("/evidence.json");
  let parsed = null;
  try {
    parsed = JSON.parse(body);
  } catch {
    /* reported below */
  }
  record(
    evidence.status === 200 &&
      Array.isArray(parsed?.projects) &&
      parsed.projects.length > 0,
    "evidence.json is served and parses",
    `${parsed?.projects?.length ?? 0} projects`,
  );

  const { response: llms, body: llmsBody } = await get("/llms.txt");
  record(llms.status === 200 && llmsBody.length > 0, "llms.txt is served");
}

async function checkAiOffFallbacks() {
  // Signal is optional by contract: a refused call must not take the site down.
  const crossOrigin = await fetch(`${origin}/api/signal/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.test" },
    body: JSON.stringify({ query: "shap" }),
  });
  record(
    crossOrigin.status === 403,
    "Signal refuses cross-origin callers",
    String(crossOrigin.status),
  );

  const { response: work } = await get("/work");
  record(work.status === 200, "evidence routes serve with no AI involved");
}

async function main() {
  console.log(`Live smoke: ${origin}\n`);
  await checkTransport();
  await checkRoutes();
  await checkRecruiterPathInHtml();
  await checkOrigin();
  await checkIndexing();
  await checkMachineReadable();
  await checkAiOffFallbacks();

  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);

  if (failed.length > 0) {
    console.error("\nFailed:");
    for (const failure of failed) {
      console.error(
        `  - ${failure.label}${failure.detail ? ` (${failure.detail})` : ""}`,
      );
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
