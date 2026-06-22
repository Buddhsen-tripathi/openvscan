import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Pin the dev server to 3000 so the browser origin matches BETTER_AUTH_URL
  // (http://localhost:3000). Otherwise Better-auth rejects sign-in/sign-up with
  // INVALID_ORIGIN because the request Origin (Vite's default :5173) isn't trusted.
  server: { port: 3000 },
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
      "@openvscan/github": new URL(
        "../packages/github/src/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
});
