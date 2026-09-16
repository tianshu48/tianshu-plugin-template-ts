import type * as World from "tianshu:plugin/plugin@0.1.0";
import { apply, read } from "tianshu:plugin/host@0.1.0";
import ui from "../ui.json";
import desc from "../plugin.json";
import { stepEcho } from "./echo";
import { stepSetAttr, stepSum } from "./play";
import { ABI_VERSION } from "./types";

export { ABI_VERSION, PLUGIN_APPLY_OPS } from "./types";

export const guest: typeof World.guest = {
  abiVersion() {
    return ABI_VERSION;
  },
  id() {
    return desc.id;
  },
  uiJson() {
    return JSON.stringify(ui);
  },
  step(kind: string, paramsJson: string) {
    if (kind === "echo") return stepEcho(kind, paramsJson, read);
    if (kind === "sum") return stepSum(kind, paramsJson, read);
    if (kind === "set_attr") return stepSetAttr(kind, paramsJson);
    return "";
  },
  onTool(id: string) {
    const tools = Array.isArray(ui.tools) ? ui.tools : [];
    for (const t of tools) {
      if (t.id !== id) continue;
      return apply(t.op ?? "", JSON.stringify(t.args ?? {}));
    }
    return "";
  },
};
