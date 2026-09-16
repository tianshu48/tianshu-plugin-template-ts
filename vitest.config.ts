import { defineConfig } from "vitest/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "tianshu:plugin/host@0.1.0": join(
        dirname(fileURLToPath(import.meta.url)),
        "src/host.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
