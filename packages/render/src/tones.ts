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

/** Paleta das séries sem tom declarado, na ordem. */
export const SERIES_TONES: readonly Tone[] = ["primary", "info", "success", "warning", "danger", "neutral"];
