import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Em desenvolvimento, `/candura` vai ao servidor do SDK (CANDURA_PUBLIC_URL, padrão http://localhost:8000).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy: { "/candura": process.env.CANDURA_PUBLIC_URL ?? "http://localhost:8000" } },
  preview: { port: 5173, proxy: { "/candura": process.env.CANDURA_PUBLIC_URL ?? "http://localhost:8000" } },
});
