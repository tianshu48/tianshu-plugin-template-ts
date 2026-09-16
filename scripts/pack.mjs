import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });
if (!existsSync(join(dist, "plugin.wasm"))) {
  throw new Error("dist/plugin.wasm missing; run pnpm build first");
}
const desc = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8")) as {
  readme?: string;
  icon?: string;
};
for (const name of ["plugin.json", "ui.json", "USER.zh.md", desc.readme, desc.icon]) {
  if (!name) continue;
  const from = join(root, name);
  if (existsSync(from)) copyFileSync(from, join(dist, name));
}
console.log("packed dist/");
