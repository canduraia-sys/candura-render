import { createComponentImplementation } from "@a2ui/react/v0_9";
import { toneOf } from "../tones";
import { WeekGridApi } from "./api";

interface Slot {
  time: string;
  status: string;
  label?: string;
  description?: string;
}
interface Day {
  label: string;
  date?: string;
  slots: Slot[];
}
interface Status {
  value: string;
  label: string;
  tone?: string;
  occupied?: boolean;
}

/** Grade semanal de horários: cada horário com o tom do seu status; `collapsible` mostra um resumo recolhível. */
export const WeekGrid = createComponentImplementation(WeekGridApi, ({ props }) => {
  const days = Array.isArray(props.days) ? (props.days as Day[]) : [];
  const statuses = new Map((props.statuses as unknown as Status[]).map((status) => [status.value, status]));
  const occupied = days.flatMap((day) => day.slots).filter((slot) => statuses.get(slot.status)?.occupied ?? true).length;
  const grid = (
    <div className="cd-week">
      {days.map((day) => (
        <section key={day.label} className="cd-week-day" data-today={day.date !== undefined && day.date === props.today}>
          <h4>{day.label}</h4>
          {day.slots.map((slot) => {
            const status = statuses.get(slot.status);
            return (
              <div key={`${day.label}-${slot.time}`} className="cd-week-slot" data-tone={toneOf(status?.tone)} title={slot.description}>
                <span className="cd-caption">{slot.time}</span>
                <span>{(status?.occupied ?? true) && slot.label ? slot.label : (status?.label ?? slot.status)}</span>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
  const summary = `${props.title ?? "Semana"} · ${occupied} horário(s) ocupado(s)`;
  return props.collapsible ? (
    <details className="cd-card">
      <summary>{summary}</summary>
      {grid}
    </details>
  ) : (
    <div className="cd-card">
      {props.title ? <h3 className="cd-chart-title">{props.title}</h3> : null}
      {grid}
    </div>
  );
});
