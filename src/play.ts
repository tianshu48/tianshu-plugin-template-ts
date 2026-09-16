import { irNumber, irText } from "./ir";
import type { HostRead } from "./types";

function parseParams(paramsJson: string): Record<string, unknown> {
  try {
    const v = JSON.parse(paramsJson) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
  } catch {
    /* empty */
  }
  return {};
}

/** `output: data` — inbound number plus field `add`. */
export function stepSum(kind: string, paramsJson: string, read: HostRead): string {
  if (kind !== "sum") return "";
  const params = parseParams(paramsJson);
  const addRaw = params.add;
  const add =
    typeof addRaw === "number" && Number.isFinite(addRaw)
      ? addRaw
      : Number(typeof addRaw === "string" ? addRaw : 0) || 0;
  const n = irNumber(read("in", "in", "")) + add;
  return JSON.stringify({
    log: `sum ${n}`,
    out: { type: "Number", value: n },
  });
}

/** `write: attr` — host writes `subject`.`attr` from the `value` field. */
export function stepSetAttr(kind: string, paramsJson: string): string {
  if (kind !== "set_attr") return "";
  const params = parseParams(paramsJson);
  const subject = String(params.subject ?? "").trim();
  const attr = String(params.attr ?? "").trim();
  const raw = params.value;
  const asNum =
    typeof raw === "number"
      ? raw
      : Number(typeof raw === "string" ? raw.trim() : NaN);
  const value =
    Number.isFinite(asNum)
      ? { type: "Number", value: asNum }
      : { type: "String", value: irText(String(raw ?? "")) };
  return JSON.stringify({
    log: `set ${subject}.${attr}`,
    set: [{ subject, attr, value }],
  });
}
