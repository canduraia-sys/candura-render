/**
 * Contexto de renderização: as origens a que `Link` e `Markdown` podem apontar e o que fazer quando a `ParamBar` muda.
 *
 * A `ParamBar` não executa ação no servidor (isso é da 0.3.3): ela pede um novo GET da **mesma** rota com a query
 * alterada, e quem faz o GET é o `CanduraView` (ou a aplicação que hospeda a surface).
 */
import { createContext, useContext } from "react";

export type ParamValues = Record<string, string | number | boolean | null>;

export interface RenderOptions {
  /** Origens permitidas para links externos (`https://app.acme.io`); relativas sempre valem. */
  allowedOrigins: readonly string[];
  /** Chamado quando o usuário aplica parâmetros na `ParamBar`. */
  onParams?: (params: ParamValues) => void;
}

export const RenderContext = createContext<RenderOptions>({ allowedOrigins: [] });

export function useRenderOptions(): RenderOptions {
  return useContext(RenderContext);
}

/** `href` seguro: relativo, ou absoluto `http(s)` de uma origem permitida; senão `undefined` (o link não abre). */
export function safeHref(href: unknown, allowedOrigins: readonly string[]): string | undefined {
  if (typeof href !== "string" || href === "") return undefined;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return allowedOrigins.some((origin) => url.origin === new URL(origin).origin) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
