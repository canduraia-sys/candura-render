import { createComponentImplementation } from "@a2ui/react/v0_9";
import { formatValue, type ValueFormat } from "../format";
import { toneOf } from "../tones";
import { StatApi } from "./api";

const TREND_SYMBOL: Record<string, string> = { up: "▲", down: "▼", flat: "▬" };

/** Indicador: rótulo, valor formatado, variação com tendência e legenda; o tom colore a variação. */
export const Stat = createComponentImplementation(StatApi, ({ props }) => {
  const tone = toneOf(props.tone);
  const trend = typeof props.trend === "string" ? TREND_SYMBOL[props.trend] : undefined;
  return (
    <div className="cd-card cd-stat" data-tone={tone}>
      <span className="cd-stat-label">{props.label}</span>
      <strong className="cd-stat-value">{formatValue(props.value, (props.format ?? "number") as ValueFormat, props.unit)}</strong>
      {props.delta || trend ? (
        <span className="cd-stat-delta cd-tone-text">
          {trend ? `${trend} ` : ""}
          {props.delta}
        </span>
      ) : null}
      {props.caption ? <span className="cd-caption">{props.caption}</span> : null}
    </div>
  );
});
