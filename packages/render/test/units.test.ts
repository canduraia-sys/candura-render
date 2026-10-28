// Utilitários: origens permitidas, Markdown sanitizado, query, cliente, formatos e séries.
import { describe, expect, it } from "vitest";
import { ViewRequestError, fetchSurface, formatDate, formatValue, safeHref, toneOf, withQuery } from "../src";
import { seriesOf } from "../src/components/Chart";
import { renderMarkdown } from "../src/components/Markdown";

describe("origens e Markdown", () => {
  const origens = ["https://app.acme.io"];
  it("só relativos e origens permitidas abrem", () => {
    expect(safeHref("/p/x", origens)).toBe("/p/x");
    expect(safeHref("https://app.acme.io/views/t", origens)).toBe("https://app.acme.io/views/t");
    for (const recusado of ["//evil.io/x", "https://evil.io/x", "javascript:alert(1)", "mailto:a@b", "", 3, "nada"]) {
      expect(safeHref(recusado, origens)).toBeUndefined();
    }
  });
  it("Markdown escapa HTML e corta links e imagens de fora", () => {
    const html = renderMarkdown('**ok** <script>x</script> [a](https://evil.io) [b](https://app.acme.io/p) ![i](https://app.acme.io/i.png)', origens);
    expect(html).toContain("<strong>ok</strong>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('href="https://evil.io');
    expect(html).toContain('href="https://app.acme.io/p"');
    expect(html).not.toContain("<img");
  });
});

describe("cliente das rotas", () => {
  it("query nova sobre a da URL", () => {
    expect(withQuery("/candura/v1/views/t?semanas=4&x=1", { semanas: 12, aluno_id: "a1", x: null })).toBe("/candura/v1/views/t?semanas=12&aluno_id=a1");
    expect(withQuery("https://api.acme.io/v?a=1", { a: "" })).toBe("https://api.acme.io/v");
  });
  it("declara os catálogos e traduz o erro", async () => {
    const vistos: RequestInit[] = [];
    const ok = (async (_: string, init: RequestInit) => (vistos.push(init), new Response('{"state":"ready","messages":[]}'))) as typeof fetch;
    expect((await fetchSurface("/v", { fetch: ok })).state).toBe("ready");
    expect((vistos[0]!.headers as Record<string, string>)["x-a2ui-catalogs"]).toContain("candura/v1");
    const nao = (async () => new Response('{"detail":"View não encontrada: view"}', { status: 404 })) as typeof fetch;
    await expect(fetchSurface("/v", { fetch: nao })).rejects.toThrow(new ViewRequestError(404, "View não encontrada: view"));
    const texto = (async () => new Response("x", { status: 406, statusText: "Not Acceptable" })) as typeof fetch;
    await expect(fetchSurface("/v", { fetch: texto })).rejects.toThrow("406");
  });
});

describe("formatos e séries", () => {
  it("formata em pt-BR", () => {
    expect(formatValue(1234.5)).toBe("1.234,5");
    expect(formatValue(87, "percent")).toBe("87%");
    expect(formatValue(10, "currency")).toContain("R$");
    expect(formatValue(5, "number", "kg")).toBe("5 kg");
    expect(formatValue(null)).toBe("—");
    expect(formatValue("x", "number", "kg")).toBe("x kg");
    expect(formatDate("2026-10-27")).toBe("27/10/2026");
    expect(formatDate("ontem")).toBe("ontem");
    expect(formatDate(undefined)).toBe("—");
    expect(toneOf("success")).toBe("success");
    expect(toneOf("vermelho")).toBe("neutral");
  });
  it("séries de y: chave, lista, specs ou todas as numéricas", () => {
    const rows = [{ s: "S1", carga: 40, volume: 900, nome: "a" }];
    expect(seriesOf("carga", rows, "s").map((x) => x.key)).toEqual(["carga"]);
    expect(seriesOf([{ key: "carga", label: "Carga", tone: "success" }, "volume"], rows, "s").map((x) => [x.key, x.label])).toEqual([
      ["carga", "Carga"],
      ["volume", "volume"],
    ]);
    expect(seriesOf(undefined, rows, "s").map((x) => x.key)).toEqual(["carga", "volume"]);
  });
});
