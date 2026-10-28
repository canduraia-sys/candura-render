/**
 * O catálogo Candura v1 no cliente: o Basic do A2UI v0.9 por inteiro (os Custom Elements do `@a2ui/web_core`) mais os
 * nove componentes de dados em React, com as funções do Basic (`formatString` e as demais). É a mesma composição do
 * `catalog.json` do SDK (Basic por `$ref` + componentes próprios), agora com implementação.
 */
import type { ReactCatalogComponent } from "@a2ui/react/v0_9";
import { Catalog } from "@a2ui/web_core/v0_9";
import { basicCatalog } from "@a2ui/web_core/v0_9/basic_catalog";
import { z } from "zod";
import { CANDURA_V1 } from "./catalog-id";
import { Badge } from "./components/Badge";
import { Chart } from "./components/Chart";
import { Link } from "./components/Link";
import { Markdown } from "./components/Markdown";
import { ParamBar } from "./components/ParamBar";
import { Stat } from "./components/Stat";
import { Table } from "./components/Table";
import { Timeline } from "./components/Timeline";
import { WeekGrid } from "./components/WeekGrid";

/** Os componentes de dados do Candura (os do Basic vêm do `basicCatalog`). */
export const canduraComponents = [Chart, Table, Stat, Badge, Timeline, WeekGrid, Markdown, Link, ParamBar] as const;

/** O tema mínimo do perfil (Q9): o mesmo esquema do `catalog.json#/$defs/theme`. */
export const ThemeSchema = z
  .object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    surfaceColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    radius: z.enum(["none", "sm", "md", "lg"]).optional(),
  })
  .strict();
export type CanduraTheme = z.infer<typeof ThemeSchema>;

export const canduraCatalog = new Catalog<ReactCatalogComponent>(
  CANDURA_V1,
  "v0.9",
  [...(basicCatalog.components.values() as Iterable<ReactCatalogComponent>), ...(canduraComponents as unknown as ReactCatalogComponent[])],
  [...basicCatalog.functions.values()],
  ThemeSchema,
);
