import { buildPublicEvidenceManifest } from "@/lib/evidence/public-manifest";

export const dynamic = "force-static";

export function GET() {
  const manifest = buildPublicEvidenceManifest();
  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "X-Evidence-Authority": "repository-graph",
      "X-Evidence-Projection": "derived",
    },
  });
}
