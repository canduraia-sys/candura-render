import MarkdownIt from "markdown-it";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { safeHref, useRenderOptions } from "../context";
import { MarkdownApi } from "./api";

/** Markdown **sanitizado**: HTML cru desligado (escapado), imagens fora, links só para origens permitidas. */
export function renderMarkdown(source: string, allowedOrigins: readonly string[]): string {
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
  md.disable(["image"]);
  md.validateLink = (url: string) => safeHref(url, allowedOrigins) !== undefined;
  return md.render(source);
}

export const Markdown = createComponentImplementation(MarkdownApi, ({ props }) => {
  const { allowedOrigins } = useRenderOptions();
  return <div className="cd-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(props.text ?? "", allowedOrigins) }} />;
});
