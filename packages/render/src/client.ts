/**
 * Cliente das rotas de view do SDK (`GET /candura/v1/views/{token}`, `/views/p/{id}`, `/views?uri=`): declara os
 * catálogos que entende (`X-A2UI-Catalogs`) e refaz o mesmo GET com a query alterada quando a `ParamBar` muda.
 */
import { supportedCatalogIds } from "./catalog-id";
import type { ParamValues } from "./context";

export interface SurfaceResponse {
  protocol: string;
  surfaceId: string;
  state: "ready" | "awaiting_params";
  messages: Record<string, unknown>[];
}

export class ViewRequestError extends Error {
  constructor(
    readonly status: number,
    detail: string,
  ) {
    super(`A view não pôde ser aberta (${status}): ${detail}`);
  }
}

/** `url` com os parâmetros na query (vazios saem; os demais da query original ficam). */
export function withQuery(url: string, params: ParamValues): string {
  const target = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.href);
  for (const [name, value] of Object.entries(params)) {
    if (value === null || value === "") target.searchParams.delete(name);
    else target.searchParams.set(name, String(value));
  }
  return /^https?:/.test(url) ? target.toString() : `${target.pathname}${target.search}`;
}

export interface FetchOptions {
  catalogs?: readonly string[];
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

/** A surface da rota; resposta não 2xx → `ViewRequestError` (404 é indistinto de propósito; 406 é sem catálogo). */
export async function fetchSurface(url: string, options: FetchOptions = {}): Promise<SurfaceResponse> {
  const doFetch = options.fetch ?? globalThis.fetch;
  const response = await doFetch(url, {
    headers: { accept: "application/json", "x-a2ui-catalogs": (options.catalogs ?? supportedCatalogIds).join(","), ...options.headers },
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      detail = ((await response.json()) as { detail?: string }).detail ?? detail;
    } catch {
      // corpo não JSON: fica o status
    }
    throw new ViewRequestError(response.status, detail);
  }
  return (await response.json()) as SurfaceResponse;
}
