import { createComponentImplementation } from "@a2ui/react/v0_9";
import { toneOf } from "../tones";
import { BadgeApi } from "./api";

/** Etiqueta curta com tom semântico. */
export const Badge = createComponentImplementation(BadgeApi, ({ props }) => (
  <span className="cd-badge" data-tone={toneOf(props.tone)}>
    {props.text}
  </span>
));
