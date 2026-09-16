import type { MetadataRoute } from "next";
import { getGraph } from "@/lib/evidence/queries";
import { ROUTE_PRIORITY, STATIC_INDEXABLE_ROUTES, absoluteUrl } from "@/lib/seo/routes";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes = getGraph().projects.map((project) => `/work/${project.slug}`);

  return [...STATIC_INDEXABLE_ROUTES, ...projectRoutes].map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: "monthly" as const,
    priority: ROUTE_PRIORITY[route] ?? 0.6,
  }));
}
