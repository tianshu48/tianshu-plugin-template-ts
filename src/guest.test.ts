import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { stepEcho } from "./echo";
import { stepSetAttr, stepSum } from "./play";
import { ABI_VERSION, PLUGIN_APPLY_OPS, guest } from "./guest";
import { irNumber, irText } from "./ir";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(name: string) {
  return JSON.parse(readFileSync(join(root, name), "utf8")) as Record<string, unknown>;
}

describe("plugin template", () => {
  it("matches plugin.json and ui.json", () => {
    const desc = readJson("plugin.json");
    const ui = readJson("ui.json");
    expect(desc.id).toBe("example.community.template");
    expect(desc.abi).toBe(3);
    expect(guest.id()).toBe(desc.id);
    expect(guest.abiVersion()).toBe(ABI_VERSION);
    expect(guest.abiVersion()).toBe(desc.abi);
    expect(desc.readme).toBe("USER.md");
    expect(readFileSync(join(root, "USER.md"), "utf8").length).toBeGreaterThan(0);
    const schema = readJson("schema/ui.schema.json") as {
      properties: { tools: { items: { properties: { op: { enum: string[] } } } } };
    };
    expect([...PLUGIN_APPLY_OPS]).toEqual(schema.properties.tools.items.properties.op.enum);
    expect(JSON.parse(guest.uiJson())).toEqual(ui);
    expect(Array.isArray(ui.nodes)).toBe(true);
    const nodes = ui.nodes as { kind: string; output?: string; write?: string }[];
    expect(nodes.map((n) => n.kind)).toEqual(["echo", "sum", "set_attr"]);
    expect(nodes.find((n) => n.kind === "sum")?.output).toBe("data");
    expect(nodes.find((n) => n.kind === "set_attr")?.write).toBe("attr");
  });

  it("echo uses text, then inbound, then host/info", () => {
    expect(guest.step("other", "{}")).toBe("");
    expect(stepEcho("echo", '{"text":"ping"}', () => "")).toBe("Echo: ping");
    expect(
      stepEcho("echo", "{}", () => JSON.stringify({ type: "String", value: "in-edge" })),
    ).toBe("Echo: in-edge");
    expect(
      stepEcho("echo", '{"info":"plugin.id"}', (k, a) => {
        expect(k).toBe("info");
        expect(a).toBe("plugin.id");
        return JSON.stringify({ type: "String", value: "example.community.template" });
      }),
    ).toBe("example.community.template");
    expect(
      stepEcho("echo", '{"host":{"kind":"param","a":"text","b":""}}', (k, a) => {
        expect(k).toBe("param");
        expect(a).toBe("text");
        return JSON.stringify({ type: "String", value: "from-param" });
      }),
    ).toBe("from-param");
  });

  it("irText unwraps host IR", () => {
    expect(irText('{"type":"String","value":"x"}')).toBe("x");
    expect(irText('{"type":"Number","value":2}')).toBe("2");
    expect(irText("plain")).toBe("plain");
    expect(irNumber('{"type":"Number","value":10}')).toBe(10);
  });

  it("sum returns wasm-computed out, set_attr returns set", () => {
    expect(JSON.parse(guest.step("sum", '{"add":0}'))).toMatchObject({ log: "sum 0" });
    const sum = JSON.parse(
      stepSum("sum", '{"add":2}', () => JSON.stringify({ type: "Number", value: 10 })),
    );
    expect(sum.out).toEqual({ type: "Number", value: 12 });
    expect(sum.log).toBe("sum 12");
    const set = JSON.parse(
      stepSetAttr("set_attr", '{"subject":"Hero","attr":"hp","value":"7"}'),
    );
    expect(set.set[0].subject).toBe("Hero");
    expect(set.set[0].value).toEqual({ type: "Number", value: 7 });
  });

  it("onTool applies the toolbar verb through host.apply", () => {
    expect(guest.onTool("missing")).toBe("");
    expect(JSON.parse(guest.onTool("place_echo"))).toEqual({
      op: "add_node",
      argsJson: JSON.stringify({ kind: "echo" }),
    });
  });
});
