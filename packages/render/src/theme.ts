/**
 * Tema por tokens (`createSurface.theme`): só `primaryColor`, `surfaceColor` e `radius` vêm do servidor; tipografia,
 * tons e o resto ficam neste pacote (`styles.css`). Os tokens viram variáveis CSS no contêiner da surface.
 */
import type { CSSProperties } from "react";
import type { CanduraTheme } from "./catalog";

const RADIUS: Record<string, string> = { none: "0px", sm: "4px", md: "8px", lg: "14px" };

export function themeStyle(theme: CanduraTheme | undefined): CSSProperties {
  const style: Record<string, string> = {};
  if (theme?.primaryColor) style["--cd-primary"] = theme.primaryColor;
  if (theme?.surfaceColor) style["--cd-surface"] = theme.surfaceColor;
  if (theme?.radius) style["--cd-radius"] = RADIUS[theme.radius] ?? RADIUS.md!;
  return style as CSSProperties;
}
