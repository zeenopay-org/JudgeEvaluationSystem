import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],

      manifest: {
        name: "Judge Evaluation System",
        short_name: "JES",
        description: "An event evaluation and scoring system for judges.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0b6b3a",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/screenshot-desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/screenshots/screenshot-mobile.png",
            sizes: "720x1280",
            type: "image/png",
          },
        ],
      },

      workbox: {
        globDirectory: "dist",
        // Cache key static files for offline support
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
    }),
  ],
});
