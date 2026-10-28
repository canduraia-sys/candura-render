import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

// Ponta a ponta (REQ-BS-11-14): o BodyStrength real com a semente do painel (§4.2) no `EmbeddedAsgiServer` do
// `candura-core` e o app web (`vite preview`) levando `/candura` a ele. O SDK vem de `CANDURA_CORE_REPO` (padrão: o
// `candura-core` ao lado deste repositório) e o Python de `CANDURA_PYTHON` (padrão: o `.venv` do workspace).
const AQUI = dirname(fileURLToPath(import.meta.url));
const CORE = process.env.CANDURA_CORE_REPO ?? resolve(AQUI, "../../../candura-core");
const PYTHON = process.env.CANDURA_PYTHON ?? resolve(CORE, "../.venv/bin/python");
const API_PORT = 8811;
const APP_PORT = 4174;
export const SERVIDOR_JSON = resolve(AQUI, ".servidor.json");

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  timeout: 30_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" } },
  use: { reducedMotion: "reduce", baseURL: `http://localhost:${APP_PORT}`, viewport: { width: 1100, height: 900 } },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1100, height: 1000 } } }],
  webServer: [
    {
      command:
        `"${PYTHON}" -m candura.examples.bodystrength.tests.fixtures.admin_e2e_server --port ${API_PORT} ` +
        `--web-url http://localhost:${APP_PORT} --out "${SERVIDOR_JSON}"`,
      cwd: CORE,
      url: `http://127.0.0.1:${API_PORT}/candura/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm --filter "@candura/a2ui-app..." build && pnpm --filter @candura/a2ui-app exec vite preview --port ${APP_PORT} --strictPort`,
      url: `http://localhost:${APP_PORT}`,
      env: { CANDURA_PUBLIC_URL: `http://127.0.0.1:${API_PORT}` },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
