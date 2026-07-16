import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Tableau de vols officiel de l'aéroport (CCI-NC). Données publiques,
      // aucune clé requise (ADR-0004). En prod, même proxy côté nginx.
      "/cci": {
        target: "https://www.aeroports.cci.nc",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/cci/, ""),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    },
  },
});
