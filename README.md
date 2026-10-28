# candura-render

Renderizadores web das views A2UI do [Candura SDK](https://github.com/canduraia-sys/candura-core): o catálogo
**Candura v1** (Basic do A2UI v0.9 por inteiro + componentes de dados) em React, com visual shadcn/Tailwind.

| Pasta | Conteúdo |
| :--- | :--- |
| `packages/render` | `@candura/a2ui-render-shadcn`: o catálogo composto (`canduraCatalog`, `supportedCatalogIds`), os componentes de dados (`Chart` sobre Recharts, `Table`, `Stat`, `Badge`, `Timeline`, `WeekGrid`, `Markdown` sanitizado, `Link` restrito às origens, `ParamBar`), o tema por tokens e o cliente das rotas (`CanduraView`, `CanduraSurface`). |
| `apps/viewer` | View Viewer (página única): fonte colada, URI do registry ou endpoint, com dados simulados pelo SDK (`POST /candura/v1/a2ui/preview`); abas de mensagens, modelo e problemas. O build vai para o SDK (`viewer/dist`). |
| `apps/app` | App web mínimo: alvo dos links `/views/{token}` e `/p/{id}` (o `public_url` do perfil `shadcn`) e dos testes. |
| `tests/visual` | Playwright (desktop e celular) sobre `catalog/candura/v1/examples/*.json`. |
| `catalog/candura/v1` | Cópia do catálogo do SDK (`catalog.json`, `rules.txt`, `examples/`). **Não edite aqui.** |

## Contrato com o SDK

- O `catalogId` é o `$id` de `catalog/candura/v1/catalog.json` (`https://candura.dev/a2ui/catalogs/candura/v1/catalog.json`); a versão do pacote acompanha a do catálogo (`1.x` = v1).
- O catálogo e os exemplos vêm do SDK: `python _scripts/a2ui_publish_catalog.py --to-render` (no `candura-core`, valida antes de copiar). O build do viewer volta com `--from-render`; `--check` falha se as cópias divergirem.
- O renderizador declara os catálogos que entende (`X-A2UI-Catalogs`); sem catálogo comum, o SDK responde 406.
- A `ParamBar` não faz ação no servidor: refaz o GET da **mesma** rota com a query alterada.
- A view nunca traz cor nem CSS: tons semânticos e o tema mínimo (`primaryColor`, `surfaceColor`, `radius`) do `createSurface`.

## Desenvolvimento

```bash
pnpm install
pnpm -r build && pnpm -r test          # unidade (Vitest, jsdom) e visual (Playwright)
pnpm --filter @candura/a2ui-visual-tests test:update   # regrava as imagens de referência
pnpm --filter @candura/a2ui-app dev                     # app em :5173, /candura → CANDURA_PUBLIC_URL (:8000)
```

Requer Node ≥ 22 e pnpm (Chromium do Playwright: `pnpm --filter @candura/a2ui-visual-tests exec playwright install chromium`).
