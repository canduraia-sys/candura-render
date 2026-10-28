// Cada surface de exemplo do catálogo desenha no jsdom com o catálogo Candura: o conteúdo de cada componente aparece
// com os dados do modelo (Basic como Custom Elements, componentes de dados em React).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CanduraSurface } from "../src";

const EXAMPLES = resolve(dirname(fileURLToPath(import.meta.url)), "../../../catalog/candura/v1/examples");
const example = (name: string) => JSON.parse(readFileSync(resolve(EXAMPLES, `${name}.json`), "utf-8")) as Record<string, unknown>[];
const ORIGINS = ["https://app.bodystrength.dev"];

async function texto(name: string): Promise<string> {
  const { container } = render(<CanduraSurface messages={example(name)} allowedOrigins={ORIGINS} />);
  await waitFor(() => expect((container.textContent ?? "").trim().length).toBeGreaterThan(0));
  return container.textContent ?? "";
}

describe("componentes de dados nos exemplos do catálogo", () => {
  it.each([
    ["Badge", ["Arquivado", "Em foco", "Adaptativo"]],
    ["Chart", ["Carga máxima por semana", "Adesão semanal", "Evolução de comportamentos"]],
    ["Link", ["Relatórios publicados", "Evolução da Ana"]],
    ["Markdown", ["Adesão = execuções concluídas", "Fichas arquivadas não entram na média."]],
    ["ParamBar", ["Período", "26 semanas", "Paciente *", "Escolha um paciente para ver o relatório."]],
    ["Stat", ["Adesão média", "62,9%", "▲ +3.1 pp", "35.400 kg"]],
    ["Table", ["Aluno", "Ana", "81,3%", "24/10/2026", "INTERMEDIARIO"]],
    ["Timeline", ["24/10/2026", "Treino A - Peito e Tríceps", "1 omitido: Crucifixo"]],
    ["WeekGrid", ["Agenda semanal · 5 horário(s) ocupado(s)", "Segunda", "Lucas", "Livre"]],
  ])("%s", async (name, esperados) => {
    const conteudo = await texto(name);
    for (const esperado of esperados) expect(conteudo).toContain(esperado);
  });

  it("aplica o tema do createSurface como variáveis CSS", () => {
    const { container } = render(<CanduraSurface messages={example("Stat")} />);
    const surface = container.querySelector<HTMLElement>(".cd-surface")!;
    expect(surface.style.getPropertyValue("--cd-primary")).toBe("#ff7f6e");
    expect(surface.style.getPropertyValue("--cd-radius")).toBe("8px");
  });

  it("links só para origens permitidas", async () => {
    const { container } = render(<CanduraSurface messages={example("Table")} allowedOrigins={[]} />);
    await waitFor(() => expect(container.textContent).toContain("Ana"));
    expect(container.querySelectorAll("a.cd-link")).toHaveLength(0);
  });

  it("ParamBar pede os parâmetros escolhidos (novo GET, sem ação)", async () => {
    const pedidos: unknown[] = [];
    render(<CanduraSurface messages={example("ParamBar")} onParams={(p) => pedidos.push(p)} />);
    const [periodo] = await screen.findAllByLabelText(/Período/);
    fireEvent.change(periodo!, { target: { value: "12" } });
    expect(pedidos.at(-1)).toMatchObject({ semanas: 12 });
  });

  it("surface sem createSurface", () => {
    render(<CanduraSurface messages={[]} />);
    expect(screen.getByText("Surface sem createSurface.")).toBeTruthy();
  });
});
