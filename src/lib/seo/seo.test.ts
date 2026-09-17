import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import {
  NOINDEX_METADATA,
  NOINDEX_ROUTES,
  ROUTE_PRIORITY,
  STATIC_INDEXABLE_ROUTES,
  absoluteUrl,
  siteUrl,
} from "@/lib/seo/routes";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const APP_DIR = join(process.cwd(), "src", "app");

/** Every static route the App Router actually serves, derived from the filesystem. */
function routesOnDisk(): string[] {
  const found: string[] = [];

  function walk(dir: string) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) {
        if (item.name === "api") continue;
        walk(full);
        continue;
      }
      if (!/^page\.tsx?$/.test(item.name)) continue;

      const segments = relative(APP_DIR, dir).split(sep).filter(Boolean);
      // Dynamic segments are enumerated from the graph, not the filesystem.
      if (segments.some((segment) => segment.startsWith("["))) continue;
      found.push(`/${segments.join("/")}`.replace(/\/$/, "") || "/");
    }
  }

  walk(APP_DIR);
  return found.sort();
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("indexing policy (M24)", () => {
  it("never lists a route as both indexable and noindex", () => {
    expect(NOINDEX_ROUTES.length).toBeGreaterThan(0);
    for (const route of NOINDEX_ROUTES) {
      expect(STATIC_INDEXABLE_ROUTES).not.toContain(route);
    }
    // The two lists are the whole policy: robots disallows NOINDEX_ROUTES and
    // the sitemap enumerates STATIC_INDEXABLE_ROUTES. Overlap would publish a
    // contradiction, which the assertions above are what actually prevent.
    expect(STATIC_INDEXABLE_ROUTES).toContain("/work");
  });

  it("classifies every page in the app — no route silently unlisted", () => {
    const onDisk = routesOnDisk();
    // Guard the guard: an empty walk must not pass this test by accident.
    expect(onDisk).toContain("/");
    expect(onDisk).toContain("/work");
    expect(onDisk).toContain("/ending");
    expect(onDisk.length).toBeGreaterThanOrEqual(
      STATIC_INDEXABLE_ROUTES.length + NOINDEX_ROUTES.length,
    );

    const classified = new Set<string>([...STATIC_INDEXABLE_ROUTES, ...NOINDEX_ROUTES]);
    const unclassified = onDisk.filter((route) => !classified.has(route));
    expect(unclassified).toEqual([]);
  });

  it("marks session-shaped pages noindex but still followable-free", () => {
    expect(NOINDEX_METADATA.robots.index).toBe(false);
    expect(NOINDEX_METADATA.robots.follow).toBe(false);
  });
});

describe("site origin (M24)", () => {
  it("stays relative until an origin is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl()).toBe("");
    expect(absoluteUrl("/work")).toBe("/work");
  });

  it("strips a trailing slash so URLs never double up", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://anish.example/");
    expect(siteUrl()).toBe("https://anish.example");
    expect(absoluteUrl("/work")).toBe("https://anish.example/work");
    expect(absoluteUrl("/")).toBe("https://anish.example/");
  });
});

describe("sitemap (M24)", () => {
  it("lists every indexable route and every project detail page", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const urls = sitemap().map((entry) => entry.url);

    for (const route of STATIC_INDEXABLE_ROUTES) expect(urls).toContain(route);
    for (const project of getGraph().projects) {
      expect(urls).toContain(`/work/${project.slug}`);
    }
    expect(urls).toHaveLength(
      STATIC_INDEXABLE_ROUTES.length + getGraph().projects.length,
    );
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("excludes session-shaped surfaces and the machine-readable routes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const urls = sitemap().map((entry) => entry.url);
    for (const route of [...NOINDEX_ROUTES, "/evidence.json", "/llms.txt"]) {
      expect(urls).not.toContain(route);
    }
  });

  it("ranks the recruiter path above the rest", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const priority = new Map(sitemap().map((entry) => [entry.url, entry.priority]));
    expect(priority.get("/")).toBe(ROUTE_PRIORITY["/"]);
    expect(priority.get("/work")).toBe(0.9);
    expect(priority.get("/labs")).toBe(0.9);
    expect(priority.get("/cv")).toBe(0.8);
    // Unranked routes fall back rather than disappearing.
    expect(priority.get("/labs/mlops")).toBe(0.6);
    for (const entry of sitemap()) {
      expect(entry.priority).toBeGreaterThan(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });

  it("emits absolute URLs once an origin exists", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://anish.example");
    for (const entry of sitemap()) {
      expect(entry.url.startsWith("https://anish.example/")).toBe(true);
    }
  });
});

describe("robots (M24)", () => {
  it("disallows session surfaces and the API, and allows the rest", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const [rule] = robots().rules as { allow: string; disallow: string[] }[];
    expect(rule.allow).toBe("/");
    expect(rule.disallow).toContain("/api/");
    for (const route of NOINDEX_ROUTES) expect(rule.disallow).toContain(route);
  });

  it("omits host and sitemap until an origin is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const result = robots();
    expect(result.sitemap).toBeUndefined();
    expect(result.host).toBeUndefined();
  });

  it("points at the sitemap once an origin is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://anish.example/");
    const result = robots();
    expect(result.sitemap).toBe("https://anish.example/sitemap.xml");
    expect(result.host).toBe("https://anish.example");
  });
});
