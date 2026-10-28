import { useState } from "react";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { useRenderOptions, type ParamValues } from "../context";
import { ParamBarApi } from "./api";

interface Field {
  name: string;
  label?: string;
  type: "string" | "integer" | "number" | "boolean" | "date";
  required?: boolean;
  value?: string | number | boolean | null;
  options?: { label: string; value: string | number | boolean }[];
}

function coerce(field: Field, raw: string): string | number | boolean | null {
  if (raw === "") return null;
  if (field.type === "integer" || field.type === "number") return Number(raw);
  if (field.type === "boolean") return raw === "true";
  return raw;
}

/** Barra de parâmetros: cada mudança (ou o botão `submit`) pede um novo GET da mesma rota com a query alterada. */
export const ParamBar = createComponentImplementation(ParamBarApi, ({ props }) => {
  const { onParams } = useRenderOptions();
  const fields = props.params as unknown as Field[];
  const [values, setValues] = useState<ParamValues>(() => Object.fromEntries(fields.map((f) => [f.name, f.value ?? null])));
  const apply = (next: ParamValues) => onParams?.(next);
  const change = (field: Field, raw: string) => {
    const next = { ...values, [field.name]: coerce(field, raw) };
    setValues(next);
    if (!props.submit) apply(next);
  };
  return (
    <form
      className="cd-parambar"
      aria-disabled={props.disabled ?? false}
      onSubmit={(event) => {
        event.preventDefault();
        apply(values);
      }}
    >
      {fields.map((field) => {
        const current = values[field.name];
        const id = `cd-param-${field.name}`;
        return (
          <label key={field.name} htmlFor={id} className="cd-param">
            <span>
              {field.label ?? field.name}
              {field.required ? " *" : ""}
            </span>
            {field.options?.length ? (
              <select id={id} name={field.name} disabled={props.disabled} value={current === null ? "" : String(current)} onChange={(e) => change(field, e.target.value)}>
                {current === null ? <option value="">Escolha…</option> : null}
                {field.options.map((option) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={field.name}
                disabled={props.disabled}
                type={field.type === "date" ? "date" : field.type === "integer" || field.type === "number" ? "number" : "text"}
                value={current === null ? "" : String(current)}
                onChange={(e) => change(field, e.target.value)}
              />
            )}
          </label>
        );
      })}
      {props.submit && !props.disabled ? <button type="submit">{props.submit}</button> : null}
    </form>
  );
});
