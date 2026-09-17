import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "content/**/*.{test,spec}.{ts,tsx}",
      // Scripts carry real guarantees too — the provenance alerting only runs
      // when the proof trail is already broken, so tests are the only thing
      // that ever exercises it.
      "scripts/**/*.{test,spec}.{ts,tsx}",
    ],
    css: true,
    // Autopsy pages mount keep-alive labs + Failure Museum; parallel CI on Windows needs headroom.
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
});
