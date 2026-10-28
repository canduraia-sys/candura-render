import { createComponentImplementation } from "@a2ui/react/v0_9";
import { safeHref, useRenderOptions } from "../context";
import { LinkApi } from "./api";

/** Navegação: o servidor já trocou `view` + `params` por um `href` assinado; aqui só origens permitidas abrem. */
export const Link = createComponentImplementation(LinkApi, ({ props }) => {
  const { allowedOrigins } = useRenderOptions();
  const href = safeHref(props.href, allowedOrigins);
  return href ? (
    <a className="cd-link" href={href}>
      {props.label}
    </a>
  ) : (
    <span className="cd-link cd-link-disabled">{props.label}</span>
  );
});
