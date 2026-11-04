// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static export for GitHub Pages: prerender the homepage plus every original
// .html URL (52 resource pages + 596 legacy pages) so existing bookmarks and
// Google results keep working with real 200 responses. Document pages
// (/doc/*) render client-side; the deploy workflow copies index.html to
// 404.html so GitHub Pages serves the app for those deep links.
const prerenderPaths = ["/"];
for (const manifestPath of [
  "src/data/resource-manifest.json",
  "src/data/legacy/manifest.json",
]) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
  for (const path of Object.keys(manifest)) prerenderPaths.push(`/${path}`);
}

export default defineConfig({
  // Outside Lovable, nitro defaults to .output/public; pin the same dist/client
  // folder the Lovable build uses so the GitHub Pages workflow finds the site.
  nitro: {
    output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    pages: prerenderPaths.map((path) => ({ path })),
    // crawlLinks off: outside Lovable it defaults on and follows links to
    // files that aren't in the project (e.g. "/Fresh App.apk"), failing the build.
    prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false },
  },
});
