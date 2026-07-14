import { defineConfig, mergeConfig } from "vitest/config";
import harness from "./vitest.config.harness";

// Plancher de couverture : valeurs initiales honnêtes (mesurées à l'adoption,
// voir ADR-0002 dans .harness/decisions/) — à remonter à chaque story, jamais
// à baisser en silence.
export default mergeConfig(
  harness,
  defineConfig({
    test: {
      coverage: {
        include: ["src/**"],
        thresholds: {
          lines: 13,
          functions: 16,
          branches: 5,
          statements: 13,
        },
      },
    },
  }),
);
