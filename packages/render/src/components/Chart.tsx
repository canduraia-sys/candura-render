import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid,
  Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { formatDate, formatValue, type ValueFormat } from "../format";
import { SERIES_TONES, toneColor, toneOf } from "../tones";
import { ChartApi } from "./api";

type Row = Record<string, unknown>;
interface Series {
  key: string;
  label: string;
  color: string;
}
const HEIGHTS: Record<string, number> = { sm: 180, md: 260, lg: 360 };

/** As séries de `y`: chave, lista de chaves ou de `{key, label, tone}`; ausente = toda chave numérica exceto `x`. */
export function seriesOf(y: unknown, rows: Row[], x: string): Series[] {
  const specs: { key: string; label?: string; tone?: string }[] =
    typeof y === "string"
      ? [{ key: y }]
      : Array.isArray(y)
        ? y.map((item) => (typeof item === "string" ? { key: item } : (item as { key: string })))
        : [...new Set(rows.flatMap((row) => Object.keys(row).filter((key) => key !== x && typeof row[key] === "number")))].map((key) => ({ key }));
  return specs.map((spec, index) => ({
    key: spec.key,
    label: spec.label ?? spec.key,
    color: toneColor(spec.tone ? toneOf(spec.tone) : (SERIES_TONES[index % SERIES_TONES.length] ?? "primary")),
  }));
}

/** Gráfico do catálogo (linha, área, barras, barras horizontais, pizza, radar) sobre o Recharts. */
export const Chart = createComponentImplementation(ChartApi, ({ props }) => {
  const rows = Array.isArray(props.rows) ? (props.rows as Row[]) : [];
  const height = HEIGHTS[props.height ?? "md"] ?? 260;
  if (rows.length === 0) return <p className="cd-empty">{props.emptyText ?? "Sem dados para o gráfico."}</p>;
  const series = seriesOf(props.y, rows, props.x);
  const valueFormat = (props.yFormat ?? "number") as ValueFormat;
  const tick = (value: unknown) => formatValue(value, valueFormat, props.unit);
  const xTick = (value: unknown) => (props.xFormat === "date" ? formatDate(value) : String(value));
  const legend = props.legend ? <Legend /> : null;
  const grid = <CartesianGrid strokeDasharray="3 3" />;
  const reference = props.reference as { value: number; label?: string; tone?: string } | undefined;
  const guide = reference ? (
    <ReferenceLine y={reference.value} label={reference.label} stroke={toneColor(toneOf(reference.tone, "warning"))} strokeDasharray="4 4" />
  ) : null;
  // Barras e áreas medem a partir de zero (eixo truncado exagera diferenças); linhas acompanham os dados.
  const baseline = props.variant === "bar" || props.variant === "horizontalBar" || props.variant === "area";
  const domain = (props.yDomain as [number, number] | undefined) ?? (baseline ? [0, "auto"] : ["auto", "auto"]);
  // Sem animação para quem pede menos movimento (e nos testes visuais, que emulam `reducedMotion: "reduce"`).
  const animate = !(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const axisWidth = props.unit || valueFormat === "currency" ? 76 : 52;
  let chart;
  switch (props.variant) {
    case "pie": {
      const [first] = series;
      chart = (
        <PieChart>
          <Pie isAnimationActive={animate} data={rows} dataKey={first?.key ?? "value"} nameKey={props.x} innerRadius={props.donut ? "55%" : 0} label={props.showValues}>
            {rows.map((row, index) => (
              <Cell key={index} fill={toneColor(props.toneKey ? toneOf(row[props.toneKey]) : (SERIES_TONES[index % SERIES_TONES.length] ?? "primary"))} />
            ))}
          </Pie>
          <Tooltip formatter={tick} />
          {legend}
        </PieChart>
      );
      break;
    }
    case "radar":
      chart = (
        <RadarChart data={rows}>
          <PolarGrid />
          <PolarAngleAxis dataKey={props.x} />
          {series.map((s) => (
            <Radar isAnimationActive={animate} key={s.key} dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} fillOpacity={0.25} />
          ))}
          {legend}
        </RadarChart>
      );
      break;
    case "area":
      chart = (
        <AreaChart data={rows}>
          {grid}
          <XAxis dataKey={props.x} tickFormatter={xTick} />
          <YAxis tickFormatter={tick} domain={domain} width={axisWidth} />
          <Tooltip formatter={tick} labelFormatter={xTick} />
          {series.map((s) => (
            <Area isAnimationActive={animate} key={s.key} dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} stackId={props.stacked ? "s" : undefined} connectNulls={props.connectNulls} />
          ))}
          {guide}
          {legend}
        </AreaChart>
      );
      break;
    case "bar":
    case "horizontalBar": {
      const horizontal = props.variant === "horizontalBar";
      chart = (
        <BarChart data={rows} layout={horizontal ? "vertical" : "horizontal"}>
          {grid}
          {horizontal ? <XAxis type="number" tickFormatter={tick} domain={domain} /> : <XAxis dataKey={props.x} tickFormatter={xTick} />}
          {horizontal ? <YAxis type="category" dataKey={props.x} width={120} /> : <YAxis tickFormatter={tick} domain={domain} width={axisWidth} />}
          <Tooltip formatter={tick} labelFormatter={xTick} />
          {series.map((s) => (
            <Bar isAnimationActive={animate} key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId={props.stacked ? "s" : undefined} label={props.showValues ? { position: horizontal ? "right" : "top" } : false}>
              {props.toneKey ? rows.map((row, index) => <Cell key={index} fill={toneColor(toneOf(row[props.toneKey ?? ""]))} />) : null}
            </Bar>
          ))}
          {guide}
          {legend}
        </BarChart>
      );
      break;
    }
    default:
      chart = (
        <LineChart data={rows}>
          {grid}
          <XAxis dataKey={props.x} tickFormatter={xTick} />
          <YAxis tickFormatter={tick} domain={domain} width={axisWidth} />
          <Tooltip formatter={tick} labelFormatter={xTick} />
          {series.map((s) => (
            <Line isAnimationActive={animate} key={s.key} dataKey={s.key} name={s.label} stroke={s.color} connectNulls={props.connectNulls} dot={false} />
          ))}
          {guide}
          {legend}
        </LineChart>
      );
  }
  return (
    <figure className="cd-card cd-chart" data-variant={props.variant}>
      {props.title ? <figcaption className="cd-chart-title">{props.title}</figcaption> : null}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    </figure>
  );
});
