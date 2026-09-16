export function irText(raw: string): string {
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && "type" in v) {
      const o = v as { type?: unknown; value?: unknown };
      if (o.type === "String" && typeof o.value === "string") return o.value;
      if (o.type === "Number" && o.value != null) return String(o.value);
    }
    if (typeof v === "string") return v;
  } catch {
    /* raw */
  }
  return raw;
}

/** Unwrap host.read IR JSON to a finite number, else 0. */
export function irNumber(raw: string): number {
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object" && "type" in v) {
      const o = v as { type?: unknown; value?: unknown };
      if (o.type === "Number" && typeof o.value === "number" && Number.isFinite(o.value)) {
        return o.value;
      }
    }
  } catch {
    /* fall through */
  }
  const n = Number(irText(raw).trim());
  return Number.isFinite(n) ? n : 0;
}
