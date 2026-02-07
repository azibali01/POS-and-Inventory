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
});
