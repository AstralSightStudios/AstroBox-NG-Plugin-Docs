# AstroBox-NG-Plugin-Docs 项目合约

## 双仓库架构

本项目使用两个独立的 Git 仓库，**没有 submodule 关联**：

| 仓库 | GitHub | 管理工具 |
|------|--------|----------|
| **主仓库**（本仓库） | `AstralSightStudios/AstroBox-NG-Plugin-Docs` | `git` / `abdocstool.py` |
| **内容仓库** | `AstralSightStudios/AstroBox-NG-Plugin-Docs-Content` | `abdocstool.py` |

### 内容仓库包含

- `content/docs/` — 文档正文（MDX/MD）
- `content/blog/` — 博客正文（MDX/MD）
- `public/assets/images/docs/` — 文档图片资源

这三个目录在主仓库中被 `.gitignore` **忽略**，本地文件通过 `abdocstool.py` 从内容仓库同步而来。

### 构建时的自动拉取

`pnpm build` 会先跑 `pnpm fetch-docs`（`scripts/fetch-docs.ts`），从内容仓库的 GitHub zip 下载最新内容。本地已有文件时自动跳过。

---

## 如何判断改动归属哪个仓库

| 改动内容 | 应提交到 | 提交方式 |
|---------|---------|---------|
| 站点代码（`src/`、`scripts/`、配置文件等） | 主仓库 | `git commit` 或 `abdocstool.py` 的 Commit |
| 依赖（`package.json`、`pnpm-lock.yaml`） | 主仓库 | `git commit` |
| 文档正文（`content/docs/` 下的 `.mdx`/`.md`） | **内容仓库** | `abdocstool.py commit`（自动同步到 `.subrepo/` 后提交） |
| 博客正文（`content/blog/` 下的 `.mdx`/`.md`） | **内容仓库** | `abdocstool.py commit`（同上） |
| 文档图片（`public/assets/images/docs/`） | **内容仓库** | `abdocstool.py commit`（同上） |

> **核心规则：** 只要修改了 `content/docs/`、`content/blog/` 或 `public/assets/images/docs/` 下的文件，就必须通过 `abdocstool.py` 提交到内容仓库，不能只提交主仓库。

---

## abdocstool.py — 一键管理

项目根目录的交互式 TUI 工具，支持键盘 `↑↓` 和鼠标操作。

```bash
python abdocstool.py
```

### 命令一览

| 菜单项 | 作用 |
|--------|------|
| `Init` | 首次初始化：clone 内容仓库 → 同步内容 → `pnpm install` |
| `Commit` | **分别提交两个仓库：** 先问主仓库提交信息，再将 `content/docs`、`content/blog` 同步到 `.subrepo/` 后提交到内容仓库 |
| `Sync` | 从远程拉取内容仓库最新内容，覆盖本地 `content/docs` |
| `Push` | 分别推送两个仓库到远程 |
| `Status` | 显示主仓库和内容仓库的当前状态、差异统计 |

### 工作流示例

```bash
# 1. 在新机器上首次使用
python abdocstool.py
# → 选 Init

# 2. 日常编辑文档后
python abdocstool.py
# → 选 Commit
# → 主仓库有改动？输入提交信息
# → 内容仓库有改动？输入提交信息
# → 完成

# 3. 需要拉取最新文档（如团队其他成员更新了内容）
python abdocstool.py
# → 选 Sync

# 4. 推送
python abdocstool.py
# → 选 Push
```

---

## agent 操作指南

### 当你需要修改文档或博客内容时

1. 直接编辑 `content/docs/`、`content/blog/` 或 `public/assets/images/docs/` 下的文件
2. 提醒用户运行 `python abdocstool.py` 并选择 `Commit` 来提交内容仓库
3. 不要手动在 `.subrepo/` 目录中操作 — 始终通过 `abdocstool.py` 同步

### 当你需要修改站点代码时

正常提交到主仓库即可，与标准 Git 工作流一致。

### 如何确认内容仓库已推送

检查 `.subrepo/AstroBox-NG-Plugin-Docs-Content/` 目录中 `git status` 是否干净，以及 `git log` 的最新提交是否已推送。
