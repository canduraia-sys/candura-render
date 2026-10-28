import { createComponentImplementation } from "@a2ui/react/v0_9";
import { formatDate } from "../format";
import { toneOf } from "../tones";
import { TimelineApi } from "./api";

interface Item {
  at: string;
  title: string;
  description?: string;
  icon?: string;
  tone?: string;
  bullets?: string[];
}

/** Linha do tempo, na ordem dos itens (o servidor ordena). */
export const Timeline = createComponentImplementation(TimelineApi, ({ props }) => {
  const items = Array.isArray(props.items) ? (props.items as Item[]) : [];
  if (items.length === 0) return <p className="cd-empty">{props.emptyText ?? "Nada por aqui."}</p>;
  return (
    <ol className="cd-timeline">
      {items.map((item, index) => (
        <li key={`${item.at}-${index}`} className="cd-timeline-item" data-tone={toneOf(item.tone)}>
          <time className="cd-caption">{formatDate(item.at)}</time>
          <strong>{item.title}</strong>
          {item.description ? <p>{item.description}</p> : null}
          {item.bullets?.length ? (
            <ul>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
});
