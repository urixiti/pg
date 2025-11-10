import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pg',  // Serve the app under /pg path
  plugins: [react()],
  assetsInclude: ["**/*.sql"],
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
    include: ['monaco-editor']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor']
        }
      }
    }
  }
});
