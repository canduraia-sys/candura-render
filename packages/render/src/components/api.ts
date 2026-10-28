/**
 * As APIs (nome + esquema Zod) dos componentes de dados do catálogo Candura v1, para o binder genérico do
 * `@a2ui/react`: propriedades dinâmicas (`Dynamic*`) chegam resolvidas ao componente; as estruturais vêm como estão.
 * O esquema normativo é o `catalog.json` (validado no servidor); aqui só o que o binder precisa para resolver.
 */
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { z } from "zod";

const S = CommonSchemas;
const text = S.DynamicString.optional();
const anyValue = S.DynamicValue.optional();

// Listas estruturais com objetos tipados: uma lista de valores soltos seria tomada pelo binder como lista de filhos.
const Column = z.object({
  key: z.string(), label: z.string(), format: z.string().optional(), align: z.string().optional(), width: z.string().optional(),
});
const Option = z.object({ label: z.string(), value: z.union([z.string(), z.number(), z.boolean()]) });
const Field = z.object({
  name: z.string(), label: z.string().optional(), type: z.string(), required: z.boolean().optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(), options: z.array(Option).optional(),
});
const Status = z.object({ value: z.string(), label: z.string(), tone: z.string().optional(), occupied: z.boolean().optional() });

export const StatApi = {
  name: "Stat",
  schema: z.object({
    label: S.DynamicString, value: S.DynamicValue, format: z.string().optional(), unit: z.string().optional(),
    delta: text, trend: anyValue, tone: anyValue, caption: text,
  }),
};
export const BadgeApi = { name: "Badge", schema: z.object({ text: S.DynamicString, tone: anyValue }) };
export const MarkdownApi = { name: "Markdown", schema: z.object({ text: S.DynamicString }) };
export const LinkApi = {
  name: "Link",
  schema: z.object({ label: S.DynamicString, href: text, view: z.string().optional(), params: z.any().optional() }),
};
export const TimelineApi = { name: "Timeline", schema: z.object({ items: S.DynamicValue, emptyText: text }) };
export const TableApi = {
  name: "Table",
  schema: z.object({
    rows: S.DynamicValue, columns: z.array(Column), pageSize: z.number().optional(), sort: z.any().optional(),
    emptyText: text,
  }),
};
export const ChartApi = {
  name: "Chart",
  schema: z.object({
    variant: z.string(), title: text, rows: S.DynamicValue, x: z.string(), y: z.any().optional(),
    stacked: z.boolean().optional(), donut: z.boolean().optional(), legend: z.boolean().optional(),
    connectNulls: z.boolean().optional(), showValues: z.boolean().optional(), toneKey: z.string().optional(),
    reference: z.any().optional(), yDomain: z.array(z.number()).optional(), yFormat: z.string().optional(),
    unit: z.string().optional(), xFormat: z.string().optional(), height: z.string().optional(), emptyText: text,
  }),
};
export const WeekGridApi = {
  name: "WeekGrid",
  schema: z.object({
    title: text, days: S.DynamicValue, statuses: z.array(Status), today: text, collapsible: z.boolean().optional(),
  }),
};
export const ParamBarApi = {
  name: "ParamBar",
  schema: z.object({ params: z.array(Field), submit: z.string().optional(), disabled: z.boolean().optional() }),
};
