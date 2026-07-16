import { defineConfig, mergeConfig } from "vitest/config";
import harness from "./vitest.config.harness";

// Plancher de couverture : relevé au niveau mesuré à chaque story qui touche de
// la logique (cliquet — ADR-0002 dans .harness/decisions/), jamais baissé en
// silence. Dernier relèvement : bascule sur la source CCI (parseur + client).
export default mergeConfig(
  harness,
  defineConfig({
    test: {
      coverage: {
        include: ["src/**"],
        thresholds: {
          lines: 61,
          functions: 57,
          branches: 39,
          statements: 59,
        },
      },
    },
  }),
);
