# AstroBox NG Plugin Docs

AstroBox 官方文档站，基于 **Next.js 16 + Fumadocs** 构建。

在线地址：<https://docs.astrobox.online>

## 仓库架构

本项目采用 **双仓库** 架构：

- **主仓库**（本仓库）：站点代码、主题、配置、构建脚本
- **内容仓库** [`AstroBox-NG-Plugin-Docs-Content`](https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Docs-Content)：文档正文（MDX）与图片资源

内容仓库独立于主仓库维护，构建时通过脚本自动拉取。

---

## 快速开始

依赖 Node ≥ 20 与 pnpm。

### 方式一：使用 abdocstool（推荐）

```bash
# 初始化（自动 clone 内容仓库 + 安装依赖）
python abdocstool.py
# 在 TUI 中选择 [Init]

# 启动开发服务器
pnpm dev
```

### 方式二：手动

```bash
# 1. 安装依赖
pnpm install

# 2. 拉取文档内容
pnpm fetch-docs

# 3. 启动开发服务器
pnpm dev
```

打开 <http://localhost:3000> 预览。

---

## abdocstool.py — 双仓库管理工具

交互式 TUI 工具，支持键盘/鼠标操作：

```bash
python abdocstool.py
```

| 功能 | 说明 |
|------|------|
| `📝 Commit` | 分别提交主仓库和内容仓库的更改 |
| `🔄 Sync` | 从远程拉取内容仓库最新内容 |
| `📤 Push` | 推送两个仓库到远程 |
| `ℹ️ Status` | 查看详细状态信息 |
| `🔧 Init` | 初始化/重新同步子仓库 |

操作：`↑↓` 切换菜单，`Enter` 执行，鼠标滚轮/点击也可操作。

---

## 常用脚本

| 脚本 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 拉取文档 + 生成 sitemap + 构建生产版本 |
| `pnpm fetch-docs` | 从内容仓库拉取最新文档（zip 方式，带本地缓存） |
| `pnpm start` | 启动生产服务器（需先 build） |
| `pnpm lint` | ESLint 检查 |
| `pnpm types:check` | 生成类型并跑 `tsc --noEmit` |
| `pnpm sitemap:generate` | 手动生成 sitemap |

---

## 目录结构

```
├── content/docs/           ← 文档正文（.gitignore，从内容仓库拉取）
│   ├── usage/              使用文档（面向普通用户）
│   ├── plugin-dev/         插件开发文档（NG 版）
│   ├── plugin-v1/          插件开发文档（旧版 v1，归档）
│   └── creator-tools/      创作者工具文档
├── public/assets/images/docs/   ← 文档图片（.gitignore，从内容仓库拉取）
├── src/app/                Next.js App Router 入口
├── src/components/         站点组件
├── scripts/
│   ├── fetch-docs.ts       构建前拉取内容仓库
│   └── generate-sitemap.ts 构建时生成 sitemap
├── abdocstool.py           双仓库管理 TUI 工具
└── .subrepo/               本地内容仓库克隆（.gitignore）
```

以上 `content/docs/` 下的目录均为 Fumadocs 的 root folder，可在侧边栏顶部切换。

---

## 编辑文档

日常编辑直接在主仓库的 `content/docs/` 和 `public/assets/images/docs/` 下修改，这些目录已被 `.gitignore` 忽略，不会污染主仓库。

编辑完成后运行 `python abdocstool.py`，选择 `Commit` 分别提交两个仓库。

---

## 贡献

1. 从 `fumadocs-dev` 切分支，改完提 PR。
2. **文档内容**的改动请通过 `abdocstool.py` 提交到内容仓库。
3. **站点代码**的改动直接提交到主仓库。
4. 提交前跑一遍 `pnpm lint` 与 `pnpm types:check`。
5. 文档正文使用 MDX，图片放到 `public/assets/images/docs/` 下。
