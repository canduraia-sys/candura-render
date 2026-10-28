/**
 * View Viewer (REQ-A2UI-20): mostra uma view com dados simulados antes de existir provider ou publicação.
 *
 * Três fontes — JSON/JSONL colado, URI do registry (autocompletar por `GET /candura/v1/a2ui/views`) ou endpoint de
 * rota — enviadas ao `POST /candura/v1/a2ui/preview` do SDK com a chave do servidor; à direita, a view renderizada e
 * as abas de mensagens, modelo de dados e problemas. Ferramenta de desenvolvimento: o SDK só a serve com
 * `CANDURA_A2UI_VIEWER=true` fora de produção.
 */
import { useEffect, useState } from "react";
import { CanduraAppHeader, CanduraSurface } from "@candura/a2ui-render-shadcn";

type Source = "source" | "uri" | "endpoint";
type Tab = "messages" | "data_model" | "issues";
interface Preview {
  messages: Record<string, unknown>[];
  data_model: Record<string, unknown> | null;
  issues: string[];
}

const API = window.location.pathname.replace(/\/viewer(\/.*)?$/, ""); // /candura/v1/a2ui
const KEY_STORAGE = "candura.viewer.key";

export function Viewer() {
  const [kind, setKind] = useState<Source>("source");
  const [value, setValue] = useState("");
  const [data, setData] = useState("auto");
  const [params, setParams] = useState("{}");
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) ?? "");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<Tab>("messages");
  const [uris, setUris] = useState<string[]>([]);
  const [preview, setPreview] = useState<Preview>();
  const [error, setError] = useState<string>();
  const headers = { "content-type": "application/json", "x-candura-api-key": key };

  useEffect(() => {
    sessionStorage.setItem(KEY_STORAGE, key);
    if (!key) return;
    fetch(`${API}/views`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((views: { uri: string }[]) => setUris(views.map((v) => v.uri)))
      .catch(() => setUris([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function load() {
    setError(undefined);
    try {
      const body = { [kind]: value, data, params: JSON.parse(params || "{}") };
      const response = await fetch(`${API}/preview`, { method: "POST", headers, body: JSON.stringify(body) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.detail ?? response.statusText);
      setPreview(json as Preview);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <div className="vw">
      <aside className="vw-side">
        <h1>View Viewer</h1>
        <label>
          Chave do servidor
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
        <label>
          Fonte
          <select value={kind} onChange={(e) => setKind(e.target.value as Source)}>
            <option value="source">JSON/JSONL colado</option>
            <option value="uri">URI do registry</option>
            <option value="endpoint">Endpoint</option>
          </select>
        </label>
        {kind === "source" ? (
          <label>
            View (.a2ui.jsonl) ou mensagens A2UI
            <textarea value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
        ) : (
          <label>
            {kind === "uri" ? "URI (view:///…)" : "URL da rota"}
            <input list="vw-uris" value={value} onChange={(e) => setValue(e.target.value)} />
            <datalist id="vw-uris">
              {uris.map((uri) => (
                <option key={uri} value={uri} />
              ))}
            </datalist>
          </label>
        )}
        <label>
          Dados
          <select value={data} onChange={(e) => setData(e.target.value)}>
            {["auto", "fixture", "synthetic", "none", "live"].map((mode) => (
              <option key={mode}>{mode}</option>
            ))}
          </select>
        </label>
        <label>
          Parâmetros (JSON)
          <input value={params} onChange={(e) => setParams(e.target.value)} />
        </label>
        <label>
          Viewport
          <select value={viewport} onChange={(e) => setViewport(e.target.value as "desktop" | "mobile")}>
            <option value="desktop">Desktop</option>
            <option value="mobile">Celular</option>
          </select>
        </label>
        <button type="button" onClick={load}>
          Recarregar
        </button>
        {error ? <p className="vw-issues" role="alert">{error}</p> : null}
      </aside>
      <main className="vw-main">
        <div className="vw-frame cd-page" data-viewport={viewport}>
          <CanduraAppHeader homeHref="#" />
          <div className="cd-page-main">
            {preview?.messages.length ? <CanduraSurface messages={preview.messages} /> : <p>Escolha uma fonte e recarregue.</p>}
          </div>
        </div>
        {preview ? (
          <section>
            <div className="vw-tabs" role="tablist">
              {(["messages", "data_model", "issues"] as Tab[]).map((name) => (
                <button key={name} type="button" role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>
                  {name === "messages" ? "Mensagens" : name === "data_model" ? "Modelo de dados" : `Problemas (${preview.issues.length})`}
                </button>
              ))}
            </div>
            <pre className="vw-pre">{JSON.stringify(preview[tab], null, 2)}</pre>
          </section>
        ) : null}
      </main>
    </div>
  );
}
