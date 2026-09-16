import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const route = process.argv[2] ?? "contact";
const html = readFileSync(join(".next", "server", "app", `${route}.html`), "utf8");
const assets = [
  ...new Set(
    [...html.matchAll(/["'](\/_next\/static\/[^"']+\.js)["']/g)].map((m) => m[1]),
  ),
];

const rows = assets
  .map((asset) => {
    const file = join(".next", decodeURIComponent(asset).replace("/_next/", ""));
    const kb = Math.round((gzipSync(readFileSync(file)).byteLength / 1024) * 10) / 10;
    return { asset, kb };
  })
  .sort((a, b) => b.kb - a.kb);

for (const row of rows) console.log(String(row.kb).padStart(8), row.asset);
console.log("html gzip KB:", Math.round((gzipSync(html).byteLength / 1024) * 10) / 10);
