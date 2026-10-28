import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// O build é uma **página única** (JS e CSS embutidos em `index.html`): o SDK a serve no caminho exato
// `/candura/v1/a2ui/viewer` por uma montagem ASGI (`ServerOptions(mounts=A2UI_VIEWER_MOUNT)`), que vale nos dois motores.
export default defineConfig({ plugins: [react(), tailwindcss(), viteSingleFile()], build: { outDir: "dist", emptyOutDir: true } });
