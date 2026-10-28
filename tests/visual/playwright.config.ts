import { defineConfig, devices } from "@playwright/test";

// Os testes abrem os exemplos do catálogo no app web (`/example/<Componente>`), servido pelo `vite preview` do build.
export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  timeout: 30_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" } },
  use: { baseURL: "http://localhost:4173", viewport: { width: 1100, height: 900 } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1100, height: 900 } } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm --filter @candura/a2ui-app build && pnpm --filter @candura/a2ui-app exec vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
