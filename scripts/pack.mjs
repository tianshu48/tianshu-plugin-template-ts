import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { packPluginFiles } from "./sign.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });
if (!existsSync(join(dist, "plugin.wasm"))) {
  throw new Error("dist/plugin.wasm missing; run pnpm build first");
}
const desc = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
for (const name of ["plugin.json", "ui.json", "USER.zh.md", desc.readme, desc.icon]) {
  if (!name) continue;
  const from = join(root, name);
  if (existsSync(from)) copyFileSync(from, join(dist, name));
}
const read = (name) => {
  const p = join(dist, name);
  return existsSync(p) ? readFileSync(p) : Buffer.alloc(0);
};
const artifact = packPluginFiles(
  read("plugin.json"),
  read("ui.json"),
  readFileSync(join(dist, "plugin.wasm")),
  desc.icon ? read(desc.icon) : Buffer.alloc(0),
  desc.readme ? read(desc.readme) : Buffer.alloc(0),
);
writeFileSync(join(dist, `${desc.id}-${desc.version}.tsz`), artifact);
console.log("packed dist/");
