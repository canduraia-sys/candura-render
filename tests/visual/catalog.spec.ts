/**
 * Testes visuais do catálogo Candura v1 (REQ-A2UI-16): cada exemplo `catalog/candura/v1/examples/<Componente>.json`
 * desenha no navegador real, sem erro de console, com o conteúdo esperado e igual à imagem de referência.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const EXEMPLOS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../catalog/candura/v1/examples");

const EXEMPLOS: Record<string, string[]> = {
  Badge: ["Arquivado", "Adaptativo"],
  Chart: ["Carga máxima por semana", "Evolução de comportamentos"],
  Link: ["Relatórios publicados"],
  Markdown: ["Fichas arquivadas não entram na média."],
  ParamBar: ["Período", "Escolha um paciente para ver o relatório."],
  Stat: ["Adesão média", "62,9%"],
  Table: ["Aluno", "81,3%"],
  Timeline: ["Treino A - Peito e Tríceps"],
  WeekGrid: ["Agenda semanal"],
};

for (const [nome, textos] of Object.entries(EXEMPLOS)) {
  test(`${nome} desenha o exemplo do catálogo`, async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    page.on("console", (mensagem) => mensagem.type() === "error" && erros.push(mensagem.text()));

    await page.goto(`/example/${nome}`);
    for (const texto of textos) await expect(page.getByText(texto, { exact: false }).first()).toBeVisible();
    if (nome === "Chart") await expect(page.locator(".recharts-surface").first()).toBeVisible();

    expect(erros).toEqual([]);
    await expect(page.locator(".cd-surface")).toHaveScreenshot(`${nome}.png`);
  });
}

test("ParamBar refaz o GET da mesma rota com a query alterada", async ({ page }) => {
  const exemplo = JSON.parse(readFileSync(resolve(EXEMPLOS_DIR, "ParamBar.json"), "utf-8")) as unknown[];
  const pedidos: string[] = [];
  await page.route("**/candura/v1/views/tok*", async (rota) => {
    pedidos.push(new URL(rota.request().url()).search);
    await rota.fulfill({ json: { protocol: "v0.9.1", surfaceId: "example-parambar", state: "ready", messages: exemplo } });
  });

  await page.goto("/views/tok");
  await page.getByLabel("Período").first().selectOption("12");

  await expect.poll(() => pedidos).toEqual(["", "?semanas=12"]);
});
