import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor: Vue ecosystem
          if (
            id.includes("node_modules/vue") ||
            id.includes("node_modules/@vue") ||
            id.includes("node_modules/vue-router") ||
            id.includes("node_modules/vue-i18n") ||
            id.includes("node_modules/@intlify")
          ) {
            return "vue-vendor";
          }
          // Vendor: Lucide icons
          if (id.includes("node_modules/lucide-vue-next")) {
            return "icons";
          }
          // Vendor: Heavy libs (AJV, sql-formatter, marked, diff, qrcode, etc.)
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 8080,
    host: true,
  },
});
