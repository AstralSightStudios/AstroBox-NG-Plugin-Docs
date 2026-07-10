# AstroBox NG Plugin Docs

AstroBox 官方文档站，基于 **Next.js 16 + Fumadocs** 构建。

在线地址：<https://docs.astrobox.online>

## 快速开始

依赖 Node ≥ 20 与 pnpm。

```bash
pnpm install
pnpm dev
```

打开 <http://localhost:3000> 预览。

## 常用脚本

| 脚本 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生成 sitemap 并构建生产版本 |
| `pnpm start` | 启动生产服务器（需先 build） |
| `pnpm lint` | ESLint 检查 |
| `pnpm types:check` | 生成类型并跑 `tsc --noEmit` |

## 目录结构

```
content/docs/
├── usage/           使用文档（面向普通用户）
├── plugin-dev/      插件开发文档（NG 版）
├── plugin-v1/       插件开发文档（旧版 v1，归档）
└── creator-tools/   创作者工具文档
```

以上均为 Fumadocs 的 root folder，可在侧边栏顶部切换。

其他关键路径：

- `src/app/` — Next.js App Router 入口与页面
- `src/components/` — 站点组件
- `src/lib/downloads.json` — 下载页数据源
- `scripts/generate-sitemap.ts` — 构建时生成 sitemap

## 贡献

1. 从 `fumadocs-dev` 切分支，改完提 PR。
2. 提交前跑一遍 `pnpm lint` 与 `pnpm types:check`。
3. 文档正文使用 MDX，图片放到对应目录的 `assets/` 或 `public/` 下。
