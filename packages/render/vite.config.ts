import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: { entry: resolve(import.meta.dirname, "src/index.ts"), formats: ["es"], fileName: "index", cssFileName: "styles" },
    rollupOptions: {
      external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, /^@a2ui\//, "recharts", "markdown-it", "zod", "clsx"],
    },
  },
  test: { environment: "jsdom", globals: true, setupFiles: ["./test/setup.ts"] },
});
