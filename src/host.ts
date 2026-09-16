/** Vitest stand-in for `tianshu:plugin/host@0.1.0`. jco supplies the real import. */

export function read(_kind: string, _a: string, _b: string): string {
  return "";
}

export function apply(op: string, argsJson: string): string {
  return JSON.stringify({ op, argsJson });
}
