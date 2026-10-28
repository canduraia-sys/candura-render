/**
 * `CanduraAppHeader`: a barra do topo das páginas que mostram views (design aprovado em 2026-10-28): o logo do Candura
 * SDK e o título do produto ("Candura µSaaS"), em coral escuro com a linha coral da POC. É moldura da aplicação, não
 * parte da view: o app web e o View Viewer a usam em volta da surface.
 */
export interface CanduraAppHeaderProps {
  /** O nome depois de "Candura" no título (padrão: "µSaaS"). */
  product?: string;
  /** Destino do logo (padrão: a raiz do app). */
  homeHref?: string;
}

export function CanduraAppHeader({ product = "µSaaS", homeHref = "/" }: CanduraAppHeaderProps) {
  return (
    <header className="cd-app-header">
      <div className="cd-app-header-inner">
        <a className="cd-app-brand" href={homeHref} aria-label="Candura SDK, início">
          <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
            <rect width="36" height="36" rx="10" fill="#ff7f6e" />
            <path d="M24.5 12.2a8 8 0 1 0 0 11.6" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="25.4" cy="18" r="2.2" fill="#ffffff" />
          </svg>
          <span className="cd-app-brand-text">
            <span className="cd-app-brand-name">Candura</span>
            <span className="cd-app-brand-sdk">SDK</span>
          </span>
        </a>
        <span className="cd-app-divider" aria-hidden="true" />
        <p className="cd-app-title">
          Candura <span className="cd-app-product">{product}</span>
        </p>
      </div>
    </header>
  );
}
