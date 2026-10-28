/**
 * Formatação dos valores dos componentes de dados (pt-BR): número, percentual, moeda e data.
 *
 * O servidor envia os dados crus (`updateDataModel`); quem formata para leitura é o renderizador.
 */

export type ValueFormat = "number" | "percent" | "currency" | "text";

const NUMBER = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const DATE = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

/** `valor` formatado; `percent` recebe pontos percentuais (87 → "87%"), não fração. */
export function formatValue(value: unknown, format: ValueFormat = "number", unit?: string): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value !== "number") return `${String(value)}${unit ? ` ${unit}` : ""}`;
  const text =
    format === "percent"
      ? `${NUMBER.format(value)}%`
      : format === "currency"
        ? CURRENCY.format(value)
        : format === "text"
          ? String(value)
          : NUMBER.format(value);
  return unit ? `${text} ${unit}` : text;
}

/** Data ISO 8601 (`2026-10-27` ou com hora) como `27/10/2026`; texto que não é data volta como veio. */
export function formatDate(value: unknown): string {
  if (typeof value !== "string" || value === "") return value === null || value === undefined ? "—" : String(value);
  const parsed = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(parsed.getTime()) ? value : DATE.format(parsed);
}
