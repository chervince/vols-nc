import { defineConfig } from "vitest/config";

// Coverage floor enforced by the harness. HARNESS-OWNED: refreshed by
// install.sh --update, do not edit (ADR-0008). Merge this into the project
// vitest config; raise the floor there via an ADR, never lower it silently.
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
