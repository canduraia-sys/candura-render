import { useMemo, useState } from "react";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { safeHref, useRenderOptions } from "../context";
import { formatDate, formatValue } from "../format";
import { toneOf } from "../tones";
import { TableApi } from "./api";

type Row = Record<string, unknown>;
interface Column {
  key: string;
  label: string;
  format?: "text" | "number" | "percent" | "date" | "badge" | "link";
  align?: "left" | "center" | "right";
  width?: "auto" | "narrow" | "wide";
}

function Cell({ column, value, allowedOrigins }: { column: Column; value: unknown; allowedOrigins: readonly string[] }) {
  switch (column.format) {
    case "number":
      return <>{formatValue(value, "number")}</>;
    case "percent":
      return <>{formatValue(value, "percent")}</>;
    case "date":
      return <>{formatDate(value)}</>;
    case "badge": {
      const badge = typeof value === "object" && value !== null ? (value as { text?: unknown; tone?: unknown }) : { text: value };
      return (
        <span className="cd-badge" data-tone={toneOf(badge.tone)}>
          {String(badge.text ?? "")}
        </span>
      );
    }
    case "link": {
      const target = (value ?? {}) as { label?: string; href?: string };
      const href = safeHref(target.href, allowedOrigins);
      return href ? <a className="cd-link" href={href}>{target.label}</a> : <span className="cd-link-disabled">{target.label}</span>;
    }
    default:
      return <>{value === null || value === undefined ? "—" : String(value)}</>;
  }
}

/** Tabela com formato por coluna, ordenação inicial (`sort`) e paginação (`pageSize`). */
export const Table = createComponentImplementation(TableApi, ({ props }) => {
  const { allowedOrigins } = useRenderOptions();
  const columns = props.columns as unknown as Column[];
  const [page, setPage] = useState(0);
  const rows = useMemo(() => {
    const all = Array.isArray(props.rows) ? [...(props.rows as Row[])] : [];
    const sort = props.sort as { key: string; descending?: boolean } | undefined;
    if (sort) {
      const direction = sort.descending ? -1 : 1;
      all.sort((a, b) => (String(a[sort.key] ?? "") > String(b[sort.key] ?? "") ? direction : -direction));
    }
    return all;
  }, [props.rows, props.sort]);
  if (rows.length === 0) return <p className="cd-empty">{props.emptyText ?? "Sem dados."}</p>;
  const size = props.pageSize ?? rows.length;
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const visible = rows.slice(page * size, page * size + size);
  return (
    <div className="cd-card cd-table-wrap">
      <table className="cd-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} data-align={column.align ?? "left"} data-width={column.width ?? "auto"}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key} data-align={column.align ?? "left"}>
                  <Cell column={column} value={row[column.key]} allowedOrigins={allowedOrigins} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 ? (
        <nav className="cd-pager">
          <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span>
            {page + 1} / {pages}
          </span>
          <button type="button" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
            Próxima
          </button>
        </nav>
      ) : null}
    </div>
  );
});
