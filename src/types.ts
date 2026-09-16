/** plugin.json / ui.json; keep in sync with ../schema. */

export type PluginDesc = {
  id: string;
  title: string;
  version: string;
  abi: 3;
  description?: string;
  readme?: string;
  icon?: string;
};

export type PluginUiField = {
  id: string;
  label: string;
  type: string;
  default?: unknown;
};

export type PluginNodeDecl = {
  kind: string;
  title: string;
  category: string;
  categoryLabel?: string;
  fields?: PluginUiField[];
  output?: "none" | "data";
  write?: "none" | "attr";
};

export type PluginUi = {
  nodes: PluginNodeDecl[];
  tools?: {
    id: string;
    title: string;
    icon: string;
    op: string;
    args?: Record<string, unknown>;
  }[];
};

export type HostRead = (kind: string, a: string, b: string) => string;

export type HostApply = (op: string, argsJson: string) => string;

export const ABI_VERSION = 3 as const;

/** Same list as host `PLUGIN_APPLY_OPS` / `tools[].op`. */
export const PLUGIN_APPLY_OPS = [
  "add_subject",
  "add_subjects",
  "add_graph",
  "move_nodes",
  "set_attr",
  "add_node",
  "set_path",
  "set_value",
  "set_formula",
  "set_roll_call",
  "set_restrict",
  "set_anchor",
  "set_listen",
  "remove_node",
  "remove_edge",
  "check",
  "bind_mapped",
  "bind_resource",
  "connect_pipe",
  "connect_data",
  "batch",
  "undo",
] as const;

export const HOST_READ_KINDS = ["in", "param", "attr", "info"] as const;

export const HOST_INFO_KEYS = [
  "plugin.id",
  "plugin.kind",
  "plugin.abi",
  "doc.version",
  "doc.graphs",
  "graph.id",
  "graph.sha256",
  "node.id",
  "play.seed",
] as const;
