/**
 * `CanduraSurface`: desenha as mensagens A2UI de uma surface com o catálogo Candura v1, o tema do `createSurface` e as
 * opções de renderização (origens permitidas, o que fazer na `ParamBar`). `CanduraView` busca a surface numa rota.
 */
import { useEffect, useMemo, useState } from "react";
import { A2uiSurface, type ReactCatalogComponent } from "@a2ui/react/v0_9";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import { canduraCatalog, type CanduraTheme } from "./catalog";
import { RenderContext, type ParamValues } from "./context";
import { fetchSurface, withQuery, type FetchOptions, type SurfaceResponse } from "./client";
import { themeStyle } from "./theme";

type Message = Record<string, unknown>;

function surfaceOf(messages: readonly Message[]) {
  const processor = new MessageProcessor<ReactCatalogComponent>([canduraCatalog]);
  processor.processMessages(messages as never);
  const create = messages.find((m) => "createSurface" in m)?.createSurface as { surfaceId: string; theme?: CanduraTheme } | undefined;
  return { surface: create ? processor.getSurface(create.surfaceId) : undefined, theme: create?.theme };
}

export interface CanduraSurfaceProps {
  messages: readonly Message[];
  allowedOrigins?: readonly string[];
  onParams?: (params: ParamValues) => void;
}

export function CanduraSurface({ messages, allowedOrigins = [], onParams }: CanduraSurfaceProps) {
  const { surface, theme } = useMemo(() => surfaceOf(messages), [messages]);
  const options = useMemo(() => ({ allowedOrigins, onParams }), [allowedOrigins, onParams]);
  if (!surface) return <p className="cd-empty">Surface sem createSurface.</p>;
  return (
    <RenderContext.Provider value={options}>
      <div className="cd-surface" style={themeStyle(theme)} data-surface={surface.id}>
        <A2uiSurface surface={surface} />
      </div>
    </RenderContext.Provider>
  );
}

export interface CanduraViewProps extends FetchOptions {
  /** A rota da view (`/candura/v1/views/{token}`, `/candura/v1/views/p/{id}`). */
  url: string;
  allowedOrigins?: readonly string[];
}

/** Abre uma rota de view; a `ParamBar` refaz o GET da mesma rota com a query alterada (sem ação no servidor). */
export function CanduraView({ url, allowedOrigins, ...fetchOptions }: CanduraViewProps) {
  const [current, setCurrent] = useState(url);
  const [response, setResponse] = useState<SurfaceResponse>();
  const [error, setError] = useState<string>();
  useEffect(() => setCurrent(url), [url]);
  useEffect(() => {
    let alive = true;
    fetchSurface(current, fetchOptions)
      .then((body) => alive && (setResponse(body), setError(undefined)))
      .catch((failure: Error) => alive && setError(failure.message));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);
  if (error) return <p className="cd-error" role="alert">{error}</p>;
  if (!response) return <p className="cd-loading">Carregando…</p>;
  return <CanduraSurface messages={response.messages} allowedOrigins={allowedOrigins} onParams={(params) => setCurrent(withQuery(current, params))} />;
}
