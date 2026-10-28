import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Label, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis,
  PolarGrid, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { formatDate, formatValue, type ValueFormat } from "../format";
import { chartColor, seriesColor, toneOf } from "../tones";
import { ChartApi } from "./api";

type Row = Record<string, unknown>;
interface Series {
  key: string;
  label: string;
  color: string;
}
const HEIGHTS: Record<string, number> = { sm: 180, md: 260, lg: 360 };
/** Eixos, legenda e tooltip na paleta da POC (marrom suave, borda creme, cartão com raio). */
const AXIS = { stroke: "var(--cd-border)", tick: { fill: "var(--cd-axis)", fontSize: 11 }, tickLine: false } as const;
const LEGEND_STYLE = { fontSize: 12, color: "var(--cd-muted)" };
/** Texto da legenda na cor do texto secundário (a cor da série fica no ícone; o coral claro ilegível não vai ao texto). */
const legendText = (value: unknown) => <span style={{ color: "var(--cd-muted)" }}>{String(value)}</span>;
const TOOLTIP_STYLE = {
  background: "var(--cd-surface)", border: "1px solid var(--cd-border)", borderRadius: 12,
  boxShadow: "0 10px 15px -3px rgb(255 127 110 / 0.12)", color: "var(--cd-text)",
};

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
    color: spec.tone ? chartColor(toneOf(spec.tone)) : seriesColor(index),
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
  const legend = props.legend ? (
    <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} itemSorter={null} formatter={legendText} />
  ) : null;
  const grid = <CartesianGrid strokeDasharray="4 4" stroke="var(--cd-border)" vertical={false} />;
  const tooltip = { contentStyle: TOOLTIP_STYLE, labelStyle: { color: "var(--cd-text)", fontWeight: 600 } };
  const reference = props.reference as { value: number; label?: string; tone?: string } | undefined;
  const guide = reference ? (
    <ReferenceLine y={reference.value} label={reference.label} stroke={chartColor(toneOf(reference.tone, "warning"))} strokeDasharray="4 4" />
  ) : null;
  // Barras e áreas medem a partir de zero (eixo truncado exagera diferenças); linhas acompanham os dados.
  const baseline = props.variant === "bar" || props.variant === "horizontalBar" || props.variant === "area";
  const domain = (props.yDomain as [number, number] | undefined) ?? (baseline ? [0, "auto"] : ["auto", "auto"]);
  // Sem animação para quem pede menos movimento (e nos testes visuais, que emulam `reducedMotion: "reduce"`).
  const animate = !(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const axisWidth = "auto" as const; // a largura do eixo acompanha o maior rótulo (sem "10.000 kg" cortado)
  const total = rows.reduce((sum, row) => sum + (Number(row[series[0]?.key ?? "value"]) || 0), 0);
  let chart;
  switch (props.variant) {
    case "pie": {
      const [first] = series;
      chart = (
        <PieChart>
          <Pie isAnimationActive={animate} data={rows} dataKey={first?.key ?? "value"} nameKey={props.x} innerRadius={props.donut ? "62%" : 0} label={props.showValues} stroke="var(--cd-surface)" strokeWidth={2}>
            {rows.map((row, index) => (
              <Cell key={index} fill={props.toneKey ? chartColor(toneOf(row[props.toneKey])) : seriesColor(index)} />
            ))}
            {props.donut ? <Label value={tick(total)} position="center" className="cd-chart-center" fill="var(--cd-text)" fontSize={28} fontWeight={800} /> : null}
          </Pie>
          <Tooltip formatter={tick} {...tooltip} />
          {legend}
        </PieChart>
      );
      break;
    }
    case "radar":
      chart = (
        <RadarChart data={rows}>
          <PolarGrid stroke="var(--cd-border)" />
          <PolarAngleAxis dataKey={props.x} tick={{ fill: "var(--cd-axis)", fontSize: 11 }} />
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
          <XAxis dataKey={props.x} tickFormatter={xTick} {...AXIS} />
          <YAxis tickFormatter={tick} domain={domain} width={axisWidth} {...AXIS} />
          <Tooltip formatter={tick} labelFormatter={xTick} {...tooltip} />
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
          {horizontal ? <XAxis type="number" tickFormatter={tick} domain={domain} {...AXIS} /> : <XAxis dataKey={props.x} tickFormatter={xTick} {...AXIS} />}
          {horizontal ? <YAxis type="category" dataKey={props.x} width="auto" {...AXIS} /> : <YAxis tickFormatter={tick} domain={domain} width={axisWidth} {...AXIS} />}
          <Tooltip formatter={tick} labelFormatter={xTick} {...tooltip} />
          {series.map((s) => (
            <Bar isAnimationActive={animate} key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={props.stacked ? 0 : [5, 5, 0, 0]} maxBarSize={28} stackId={props.stacked ? "s" : undefined} label={props.showValues ? { position: horizontal ? "right" : "top" } : false}>
              {props.toneKey ? rows.map((row, index) => <Cell key={index} fill={chartColor(toneOf(row[props.toneKey ?? ""]))} />) : null}
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
          <XAxis dataKey={props.x} tickFormatter={xTick} {...AXIS} />
          <YAxis tickFormatter={tick} domain={domain} width={axisWidth} {...AXIS} />
          <Tooltip formatter={tick} labelFormatter={xTick} {...tooltip} />
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
