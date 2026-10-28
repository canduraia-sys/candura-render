import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@candura/a2ui-render-shadcn/styles.css";
import "./viewer.css";
import { Viewer } from "./Viewer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Viewer />
  </StrictMode>,
);
