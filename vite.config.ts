import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@hooks": "/src/hooks",
      "@utils": "/src/utils",
      "@api": "/src/api",
      "@lib": "/src/lib",
      "@contexts": "/src/contexts",
      "@pages": "/src/pages",
      "@types": "/src/types",
    },
  },
  build: {
    minify: "esbuild",
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("react-router-dom") ||
            id.includes("@remix-run/router") ||
            id.includes("react-dom") ||
            /node_modules\/react\//.test(id)
          ) {
            return "react-vendor";
          }

          if (
            id.includes("@mantine/") ||
            id.includes("@emotion/") ||
            id.includes("tabbable")
          ) {
            return "mantine-vendor";
          }

          if (
            id.includes("recharts") ||
            id.includes("victory-vendor") ||
            id.includes("d3-") ||
            id.includes("prop-types")
          ) {
            return "charts-vendor";
          }

          if (id.includes("@tanstack/")) {
            return "query-vendor";
          }

          if (id.includes("axios")) {
            return "network-vendor";
          }

          if (
            id.includes("jspdf") ||
            id.includes("html2canvas") ||
            id.includes("canvg") ||
            id.includes("svg-pathdata") ||
            id.includes("stackblur-canvas") ||
            id.includes("fflate") ||
            id.includes("rgbcolor")
          ) {
            return "print-vendor";
          }

          if (id.includes("core-js")) {
            return "polyfills-vendor";
          }

          if (id.includes("lodash") || id.includes("dayjs")) {
            return "utils-vendor";
          }

          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: increases warning limit to 1000KB
  },
});
