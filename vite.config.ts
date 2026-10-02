// Hand-written Vite config (no third-party wrapper). Wires up the same pieces
// the app has always used:
//   - tanstackStart(): file-based routing + SSR integration. It auto-discovers
//     src/server.ts and src/start.ts by convention — no extra options needed.
//   - nitro(): the build/SSR bundler. Preset is "cloudflare_module" to match
//     the Workers-style fetch(request, env, ctx) handler already written in
//     src/server.ts. If you later deploy somewhere other than Cloudflare
//     Workers, this preset (and that handler) are what to change.
//   - viteReact(), tailwindcss(), tsConfigPaths(): standard React/Tailwind/"@"
//     path-alias support.
//   - VitePWA(): service worker + manifest for offline/installable support.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 8080,
  },
  resolve: {
    // Guards against duplicate React copies causing "Invalid hook call" errors.
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    nitro({
      preset: "cloudflare_module",
      compatibilityDate: "2024-09-19",
    }),
    viteReact(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      manifest: {
        name: "Smart Student Portal",
        short_name: "Student Portal",
        description:
          "Manage attendance, timetable, semester fees, marks and assignments in one student app.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#1E3A8A",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-navigations",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ request, sameOrigin }: { request: Request; sameOrigin: boolean }) =>
              sameOrigin && ["style", "script", "font", "image"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
