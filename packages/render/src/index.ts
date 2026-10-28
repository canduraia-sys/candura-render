/**
 * `@candura/a2ui-render-shadcn`: o renderizador React do catálogo A2UI Candura v1.
 *
 *     import { CanduraView } from "@candura/a2ui-render-shadcn";
 *     import "@candura/a2ui-render-shadcn/styles.css";
 *     <CanduraView url={`/candura/v1/views/${token}`} allowedOrigins={["https://app.acme.io"]} />
 */
import "./styles.css";

export { CANDURA_V1, supportedCatalogIds } from "./catalog-id";
export { ThemeSchema, canduraCatalog, canduraComponents, type CanduraTheme } from "./catalog";
export { RenderContext, safeHref, useRenderOptions, type ParamValues, type RenderOptions } from "./context";
export { ViewRequestError, fetchSurface, withQuery, type FetchOptions, type SurfaceResponse } from "./client";
export { CanduraSurface, CanduraView, type CanduraSurfaceProps, type CanduraViewProps } from "./CanduraSurface";
export { CanduraAppHeader, type CanduraAppHeaderProps } from "./AppHeader";
export { formatDate, formatValue, type ValueFormat } from "./format";
export { TONES, toneOf, type Tone } from "./tones";
export { themeStyle } from "./theme";
