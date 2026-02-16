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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.split("node_modules/")[1].split("/")[0];
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: increases warning limit to 1000KB
  },
});
