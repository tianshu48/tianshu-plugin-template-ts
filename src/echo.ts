import { irText } from "./ir";
import type { HostRead } from "./types";

const ECHO = "echo";

/** Guest `step` helper. `read` is `host.read` on a component. */
export function stepEcho(kind: string, paramsJson: string, read: HostRead): string {
  if (kind !== ECHO) return "";
  let params: Record<string, unknown> = {};
  try {
    const v = JSON.parse(paramsJson) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      params = v as Record<string, unknown>;
    }
  } catch {
    params = {};
  }
  const host = params.host;
  if (host && typeof host === "object") {
    const spec = host as Record<string, unknown>;
    const k = typeof spec.kind === "string" ? spec.kind : "";
    const a = typeof spec.a === "string" ? spec.a : "";
    const b = typeof spec.b === "string" ? spec.b : "";
    return irText(read(k, a, b));
  }
  if (typeof params.info === "string") {
    return irText(read("info", params.info, ""));
  }
  let text = typeof params.text === "string" ? params.text.trim() : "";
  if (!text) text = irText(read("in", "in", ""));
  return `Echo: ${text}`;
}
