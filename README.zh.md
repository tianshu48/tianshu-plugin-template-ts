# TypeScript 插件模板

[English](README.md)

这份仓库本身就是一个能装进天枢的完整插件。Guest 用 TypeScript。不需要再克隆 WIT 仓：`wit/`、`schema/`、`docs/` 已经钉在这里。`pnpm build` 在 `dist/` 放下 `plugin.wasm`、`plugin.json`、`ui.json`、`USER.md`、`icon.svg`。wasm 里带着 JS 引擎，大约 12 MB。

## 先跑通

```bash
pnpm install
pnpm test
pnpm check
pnpm build
```

`pnpm check` 会先生成 `types/generated`（来自 `wit/plugin.wit`），再跑 `tsc`。打开天枢：设置 → 插件 → 添加本地插件，选这个仓库的 `dist/`。应用会拷一份到自己的插件目录。`pnpm test` 覆盖三个 kind、`host.read` 和 `on-tool`。

## 源码对着看

| 文件 | 作用 |
|---|---|
| `plugin.json` | id、标题、版本。`id()` 读这份。`readme` 指向设置页说明（模板是 `USER.md`） |
| `ui.json` | 三个节点：`echo`、`sum`（`output: data`）、`set_attr`（`write: attr`），外加工具栏「Echo」 |
| `src/guest.ts` | WIT 导出。按 `kind` 分到下面两个文件 |
| `src/echo.ts` | `echo`：日志 |
| `src/play.ts` | `sum` 算出 `out`；`set_attr` 组好 `set` |
| `docs/` | `host.read`、`host.apply`、Play 扩展槽 |

## 改成你自己的

1. 改 `plugin.json` 的 `id`、`title`、`description`、`version`。`abi` 保持 `3`。
2. 在 `ui.json` 的 `nodes` 里写节点。每个 `kind` 要在 `src/guest.ts` 的 `step` 里有分支。`title` 是画布上的名字。`category` / `categoryLabel` 是左侧库分组。`fields` 是节点参数。下游要拉值时写 `output: "data"`；管道步进里改属性时写 `write: "attr"`。细则：[扩展槽在 Play 里是什么](docs/play-node.zh.md)。
3. 步进用 `host.read`，工具栏用 `host.apply`，来自 `tianshu:plugin/host@0.1.0`。
4. 要工具栏按钮时，在 `ui.json` 加 `tools`。点按钮会跑 `onTool`。动词表：[host.apply](docs/host-apply.zh.md)。
5. Play 取值：[host.read](docs/host-read.zh.md)。
6. 发给别人之前，改 `USER.md`（以及 `USER.zh.md`）。不要把这篇脚手架步骤发给用户。
7. 工具栏若要自己的图：在 `on-tool` 里 `add_graph`，记下返回的 `id`，再 `add_node` 带 `graphId`。图落在 `plugin/<你的id>` 下，最多 4 张。细则见 [host.apply](docs/host-apply.zh.md) 的「图」。

图上完整 kind 是 `p:<你的id>:<kind>`。

## plugin.json

| 字段 | 必填 | 含义 |
|---|---|---|
| `id` | 是 | 插件 id，字母开头，可含 `.` `_` `-` |
| `title` | 是 | 显示名 |
| `version` | 是 | 版本字符串 |
| `abi` | 是 | `3` |
| `description` | 否 | 说明 |
| `readme` | 否 | 同目录说明文件名（设置页） |
| `icon` | 否 | 同目录图标文件名 |

## ui.json

根对象是 `nodes`，可加 `tools`。节点上：`kind`、`title`、`category` 必填；`categoryLabel` 是库里这一组的显示名；`fields` 是节点参数；可选 `output`（`data` 则可拉）和 `write`（`attr` 则可改属性）。每个 field 有 `id`、`label`、`type`（模板里用 `"string"`），以及可选的 `default`。`echo` 两项都不写，只打日志；`sum` / `set_attr` 见 [扩展槽在 Play 里是什么](docs/play-node.zh.md)。

`tools`：`id`、`title`、`icon`（同目录 `.svg`）、`op`、`args`。完整动词表见 [host.apply](docs/host-apply.zh.md)。`args` 里的 `$selected` / `$selected2` 会换成当前选中的节点。图标把工具栏文字挤着了，文字会藏起来。

`step(kind, params-json)` 的 `kind` 就是 `nodes[].kind`。`params-json` 的键对应 `fields[].id`。入边 `read("in", "in", "")`，字段 `read("param", "<id>", "")`，先用 `irText` 解开宿主返回的 IR JSON。
