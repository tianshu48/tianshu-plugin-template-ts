# TypeScript plugin template

[中文](README.zh.md)

This is a TypeScript plugin for Tianshu. `pnpm build` writes `plugin.wasm`, `plugin.json`, `ui.json`, `USER.md`, and `icon.svg` into `dist/`. The wasm includes the JS engine (about 12 MB).

## Run it first

```bash
pnpm install
pnpm test
pnpm check
pnpm build
```

`pnpm check` generates `types/generated` from `wit/plugin.wit`, then runs `tsc`. In Tianshu: Settings → Plugins → Add local plugin, and choose this repo's `dist/` folder. The app copies the files into its plugin directory. `pnpm test` covers all three kinds, `host.read`, and `on-tool`.

## Where the code is

| File | Role |
|---|---|
| `plugin.json` | id, title, version. `id()` reads this. `readme` is the settings page (`USER.md` in this template) |
| `ui.json` | Three nodes: `echo`, `sum` (`output: data`), `set_attr` (`write: attr`), plus the Echo toolbox button |
| `src/guest.ts` | WIT exports. Dispatches `step` by `kind` |
| `src/echo.ts` | `echo` log line |
| `src/play.ts` | `sum` computes `out`; `set_attr` builds `set` |
| `docs/` | `host.read`, `host.apply`, Play extension slots |

## Make it yours

1. Edit `id`, `title`, `description`, and `version` in `plugin.json`. Keep `abi` at `3`.
2. Declare nodes in `ui.json` `nodes`. Each `kind` needs a branch in `src/guest.ts` `step`. `title` is the canvas name. `category` / `categoryLabel` is the left-library group. `fields` are parameters. Set `output` to `"data"` if downstream should pull this cell; set `write` to `"attr"` if a pipe step may change subject attributes. See [What an extension node is in Play](docs/play-node.md).
3. `host.read` and `host.apply` come from `tianshu:plugin/host@0.1.0`.
4. For a toolbox button, add `tools` in `ui.json`. Clicks run `onTool`. Verbs: [host.apply](docs/host-apply.md).
5. Values during Play: [host.read](docs/host-read.md).
6. Before you ship, rewrite `USER.md` (and `USER.zh.md`). Do not leave this scaffolding in settings.
7. To give the plugin its own graphs, call `add_graph` from `on-tool`, keep the returned `id`, then `add_node` with `graphId`. The host puts those graphs under `plugin/<your id>`, at most 4. Details: [host.apply](docs/host-apply.md) Graphs.

The kind on the graph is `p:<your-id>:<kind>`.

## Catalog

Tag `v` plus the `plugin.json` `version` (`v0.1.0` when version is `0.1.0`). The release workflow puts a `.tsz` plugin pack on the GitHub Release and writes `proposals/<id>/<version>.json`.

Local plugin pack signing: log in on this computer, then `node scripts/sign.mjs --user-id <tianshu user id>` after you build. Windows default is `%APPDATA%\com.tianshu.desktop\identity\user.sk.hex`. If it is not there, `--sk` takes the path. The signed pack lands in `dist/`.

With `INDEX_PR_TOKEN` the workflow opens a pull request on [tianshu48/tianshu-plugin-index](https://github.com/tianshu48/tianshu-plugin-index) `main`. If you have no token, fork that repo, add the json, and open the PR.

`example.community.template` and ids that start with `tianshu` are rejected. After approval, an unsigned pack gets a request to sign; a signed pack is merged.

## plugin.json

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Plugin id, starts with a letter, may include `.` `_` `-` |
| `title` | yes | Display name |
| `version` | yes | Version string |
| `abi` | yes | `3` |
| `description` | no | Description |
| `readme` | no | Readme filename in the same directory (settings) |
| `icon` | no | Icon filename in the same directory |

## ui.json

Root object is `nodes` plus optional `tools`. On a node, `kind`, `title`, and `category` are required; `categoryLabel` is the library group title; `fields` are parameters; optional `output` (`data` if pullable) and `write` (`attr` if the host may set attributes). Each field has `id`, `label`, `type` (this template uses `"string"`), and optional `default`. `echo` omits both and only logs. `sum` / `set_attr`: [What an extension node is in Play](docs/play-node.md).

A tool is a toolbox button: `id`, `title`, `icon` (an `.svg` next to `ui.json`), `op`, and `args`. Full table: [host.apply](docs/host-apply.md). `$selected` / `$selected2` in args become the current canvas selection. The workbench hides toolbox text when the extra icons would collide with it.

`step(kind, params-json)`: `kind` is `nodes[].kind`. Keys in `params-json` match `fields[].id`. Inbound: `read("in", "in", "")`. Param: `read("param", "<id>", "")`. Run the host string through `irText` first.
