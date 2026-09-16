import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    // Phase 25 audit: this previously only globbed src/lib, so pre-existing
    // suites outside it (e.g. src/constants/bottomNav.test.ts) silently never
    // ran. Widened to every *.test.ts under src so all pure-logic suites are
    // actually executed. Component/hook rendering tests are intentionally
    // out of scope here — no React Native test renderer is installed, and
    // adding one is a dependency change outside Phase 25.
    include: ["src/**/*.test.ts"],
  },
});
