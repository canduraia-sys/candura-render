import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CanduraAppHeader, CanduraSurface, CanduraView } from "@candura/a2ui-render-shadcn";
import "@candura/a2ui-render-shadcn/styles.css";
import { routeOf } from "./routes";

const examples = import.meta.glob<{ default: Record<string, unknown>[] }>("../../../catalog/candura/v1/examples/*.json", { eager: true });
const ORIGINS = [window.location.origin];

function App() {
  const route = routeOf(window.location.pathname, window.location.search);
  if (route.kind === "view") return <CanduraView url={route.api} allowedOrigins={ORIGINS} />;
  if (route.kind === "example") {
    const messages = examples[`../../../catalog/candura/v1/examples/${route.name}.json`]?.default;
    return messages ? <CanduraSurface messages={messages} allowedOrigins={ORIGINS} /> : <p>Exemplo inexistente.</p>;
  }
  return <p>Abra um link de view (/views/…) ou de publicação (/p/…).</p>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="cd-page">
      <CanduraAppHeader />
      <main className="cd-page-main">
        <App />
      </main>
    </div>
  </StrictMode>,
);
