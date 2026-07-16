import { defineConfig, mergeConfig } from "vitest/config";
import harness from "./vitest.config.harness";

// Plancher de couverture : relevé au niveau mesuré à chaque story qui touche de
// la logique (cliquet — ADR-0002 dans .harness/decisions/), jamais baissé en
// silence. Dernier relèvement : tests de src/api/flights.ts.
export default mergeConfig(
  harness,
  defineConfig({
    test: {
      coverage: {
        include: ["src/**"],
        thresholds: {
          lines: 53,
          functions: 50,
          branches: 25,
          statements: 51,
        },
      },
    },
  }),
);
