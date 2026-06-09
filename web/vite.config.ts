import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
      "@openvscan/db": new URL("../packages/db/src/index.ts", import.meta.url)
        .pathname,
      "@openvscan/types": new URL(
        "../packages/types/src/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
});
