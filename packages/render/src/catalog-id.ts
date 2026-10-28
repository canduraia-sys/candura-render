/**
 * Identidade do catálogo que este pacote realiza.
 *
 * O `catalogId` é uma constante do catálogo: o `$id` de `catalog/candura/v1/catalog.json`, o mesmo que o SDK emite em
 * `createSurface.catalogId`. A versão do pacote acompanha a do catálogo (`1.x` = catálogo v1).
 */
export const CANDURA_V1 = "https://candura.dev/a2ui/catalogs/candura/v1/catalog.json";

/** Os catálogos que o renderizador entende (enviados ao servidor em `X-A2UI-Catalogs`). */
export const supportedCatalogIds: readonly string[] = [CANDURA_V1];
