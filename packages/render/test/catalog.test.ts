// O catálogo do cliente é o do SDK: mesmo `catalogId`, os mesmos componentes e funções (Basic + Candura).
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CANDURA_V1, canduraCatalog, supportedCatalogIds } from "../src";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../catalog/candura/v1");
const document = JSON.parse(readFileSync(resolve(ROOT, "catalog.json"), "utf-8")) as {
  $id: string;
  catalogId: string;
  components: Record<string, unknown>;
  functions: Record<string, unknown>;
};

describe("catálogo Candura v1", () => {
  it("tem o catalogId do catalog.json do SDK", () => {
    expect(CANDURA_V1).toBe(document.catalogId);
    expect(document.$id).toBe(document.catalogId);
    expect(supportedCatalogIds).toEqual([CANDURA_V1]);
    expect(canduraCatalog.id).toBe(CANDURA_V1);
  });

  it("implementa todos os componentes e funções do catálogo", () => {
    expect([...canduraCatalog.components.keys()].sort()).toEqual(Object.keys(document.components).sort());
    expect([...canduraCatalog.functions.keys()].sort()).toEqual(Object.keys(document.functions).sort());
  });

  it("tem um exemplo por componente Candura", () => {
    const examples = readdirSync(resolve(ROOT, "examples")).map((file: string) => file.replace(".json", "")).sort();
    expect(examples).toEqual(["Badge", "Chart", "Link", "Markdown", "ParamBar", "Stat", "Table", "Timeline", "WeekGrid"]);
  });
});
