/**
 * Tons semânticos do catálogo (`neutral`, `primary`, `success`, `warning`, `danger`, `info`). A view nunca traz cor:
 * cada tom vira uma variável CSS do tema (`--cd-tone-<tom>`), definida em `styles.css` e ajustada por `primaryColor`.
 */

export const TONES = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
export type Tone = (typeof TONES)[number];

export function toneOf(value: unknown, fallback: Tone = "neutral"): Tone {
  return typeof value === "string" && (TONES as readonly string[]).includes(value) ? (value as Tone) : fallback;
}

/** A cor do tom (para gráficos, que precisam do valor e não de uma classe). */
export function toneColor(tone: Tone): string {
  return `var(--cd-tone-${tone})`;
}

/** A cor de um tom num gráfico: os tons vivos da POC (`--cd-chart-<tom>`); `neutral` é o coral claro de séries de
 * referência (planejado, meta), sem competir com a série principal. */
export function chartColor(tone: Tone): string {
  return `var(--cd-chart-${tone}, var(--cd-tone-${tone}))`;
}

/** Paleta das séries sem tom declarado, na ordem (a da POC: coral, verde, azul, amarelo, lilás, laranja). */
export const SERIES_COLORS: readonly string[] = [1, 2, 3, 4, 5, 6].map((n) => `var(--cd-series-${n})`);

/** A cor da série `index` sem tom declarado. */
export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length] ?? "var(--cd-series-1)";
}
