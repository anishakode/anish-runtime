import type { MetadataRoute } from "next";
import { NOINDEX_ROUTES, siteUrl } from "@/lib/seo/routes";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...NOINDEX_ROUTES, "/api/"],
      },
    ],
    ...(base === "" ? {} : { sitemap: `${base}/sitemap.xml`, host: base }),
  };
}
