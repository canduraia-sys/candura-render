/**
 * As rotas do app web e a rota do SDK de cada uma (o `public_url` do perfil `shadcn` aponta para este app):
 *
 * | App | SDK |
 * | :--- | :--- |
 * | `/views/{token}` | `GET /candura/v1/views/{token}` |
 * | `/p/{id}` | `GET /candura/v1/views/p/{id}` |
 * | `/example/{Componente}` | o exemplo do catálogo (testes visuais, sem servidor) |
 */
export type Route = { kind: "view"; api: string } | { kind: "example"; name: string } | { kind: "home" };

export function routeOf(pathname: string, search = ""): Route {
  const token = /^\/views\/([^/]+)\/?$/.exec(pathname);
  if (token) return { kind: "view", api: `/candura/v1/views/${token[1]}${search}` };
  const publication = /^\/p\/([^/]+)\/?$/.exec(pathname);
  if (publication) return { kind: "view", api: `/candura/v1/views/p/${publication[1]}${search}` };
  const example = /^\/example\/([A-Za-z]+)\/?$/.exec(pathname);
  if (example) return { kind: "example", name: example[1]! };
  return { kind: "home" };
}
