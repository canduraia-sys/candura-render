import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// O build é uma **página única** (JS e CSS embutidos em `index.html`): o nginx do grupo frontend (alvo `dev` do
// `Dockerfile.frontend` do SDK) a serve no caminho exato `/candura/v1/a2ui/viewer`, e a página deriva a API desse
// caminho (`/candura/v1/a2ui`). Em desenvolvimento, a mesma base, e o resto de `/candura` vai ao servidor do SDK
// (CANDURA_PUBLIC_URL, padrão http://localhost:8000). A base vai pelo `overrideConfig`: o plugin impõe `base: "./"`.
const base = "/candura/v1/a2ui/viewer/";
const proxy = { "^/candura/(?!v1/a2ui/viewer(?:[/?]|$))": process.env.CANDURA_PUBLIC_URL ?? "http://localhost:8000" };

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile({ overrideConfig: { base } })],
  build: { outDir: "dist", emptyOutDir: true },
  server: { port: 5174, proxy },
  preview: { port: 5174, proxy },
});
