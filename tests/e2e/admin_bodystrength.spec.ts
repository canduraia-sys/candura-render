/**
 * Ponta a ponta com o renderer (REQ-BS-11-14): o app web abre a publicação durável da `AdminBodyStrength` do personal
 * `p-ana` (`/p/{id}`), servida pelo BodyStrength real com a semente da §4.2 (`hoje = 2026-10-26`): três abas e dois
 * gráficos com os números da semente, e a troca de período na `ParamBar` refaz o GET e atualiza os KPIs.
 */
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { SERVIDOR_JSON } from "./playwright.config";

function publicacao(): string {
  return (JSON.parse(readFileSync(SERVIDOR_JSON, "utf-8")) as { publication: string }).publication;
}

function semErros(page: Page): string[] {
  const erros: string[] = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("console", (mensagem) => mensagem.type() === "error" && erros.push(mensagem.text()));
  return erros;
}

const kpi = (page: Page, rotulo: string) => page.locator(".cd-stat", { hasText: rotulo });

test("o painel do personal desenha as três abas e os gráficos com os números da semente", async ({ page }) => {
  const erros = semErros(page);
  await page.goto(publicacao());

  await expect(page.getByText("Administração · 2026-08-31 a 2026-10-26")).toBeVisible();
  await expect(page.locator(".cd-stat")).toHaveCount(5);
  await expect(kpi(page, "Execuções")).toContainText("35");
  await expect(kpi(page, "Adesão média")).toContainText("62,9%");
  await expect(page.locator(".recharts-wrapper")).toHaveCount(2); // barras por semana e pizza por status
  await expect(page.getByRole("row", { name: /^Ana .* 26 81,3% 24\/10\/2026/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /^Bruno .* 9 44,4% 20\/10\/2026/ })).toBeVisible();

  await expect(page.locator(".cd-surface")).toHaveScreenshot("painel-alunos.png");
  await expect(page.locator(".recharts-wrapper").first()).toHaveScreenshot("grafico-execucoes-por-semana.png");
  await page.getByRole("button", { name: "Treinos", exact: true }).click();
  await expect(page.getByText("Treino B - Costas e Bíceps")).toBeVisible();
  await expect(page.locator(".cd-surface")).toHaveScreenshot("painel-treinos.png");
  await page.getByRole("button", { name: "Execuções", exact: true }).click();
  await expect(page.getByText("Ana · Treino A - Peito, Ombro e Tríceps").first()).toBeVisible();
  await expect(page.locator(".cd-surface")).toHaveScreenshot("painel-execucoes.png");
  expect(erros).toEqual([]);
});

test("a troca de período na ParamBar refaz o GET e atualiza os KPIs", async ({ page }) => {
  await page.goto(publicacao());
  await expect(kpi(page, "Execuções")).toContainText("35");

  const pedido = page.waitForRequest((r) => r.url().includes(`/candura/v1/views${publicacao()}`) && r.url().includes("semanas=12"));
  await page.locator("#cd-param-semanas").selectOption("12");
  await pedido;

  await expect(page.getByText("Administração · 2026-08-03 a 2026-10-26")).toBeVisible();
  await expect(kpi(page, "Execuções")).toContainText("47");
});
