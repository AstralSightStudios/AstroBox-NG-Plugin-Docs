#!/usr/bin/env python3
"""
AstroBox Docs Tool — 主仓库与内容子仓库的同步管理 CLI

用法:
    python abdocstool.py init          首次初始化，clone 子仓库并同步内容
    python abdocstool.py status        查看两个仓库的当前状态与差异
    python abdocstool.py commit        交互式分别提交主仓库和内容仓库
    python abdocstool.py sync          从远程拉取内容仓库最新内容到本地
    python abdocstool.py push          推送两个仓库到远程

设计约定:
    - 主仓库: AstroBox-NG-Plugin-Docs（代码、配置、主题）
    - 内容仓库: AstroBox-NG-Plugin-Docs-Content（文档 markdown + 图片资源）
    - 本地子仓库位置: .subrepo/AstroBox-NG-Plugin-Docs-Content（gitignore 忽略）
    - 主仓库中的 content/docs 和 public/assets/images/docs 已被 gitignore，
      编辑后通过本工具同步到子仓库再提交。
"""

from __future__ import annotations

import argparse
import filecmp
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable

# ── 配置 ──────────────────────────────────────────────────────────
SUBREPO_URL = "https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Docs-Content.git"
SUBREPO_NAME = "AstroBox-NG-Plugin-Docs-Content"

# (主仓库相对路径, 子仓库相对路径)
SYNC_PAIRS: list[tuple[str, str]] = [
    ("content/docs", "content/docs"),
    ("public/assets/images/docs", "public/assets/images/docs"),
]

# 主仓库中需要忽略的文件/目录（不属于主仓库提交范围）
MAIN_IGNORED = {"content/docs", "public/assets/images/docs", ".subrepo"}

# ── 颜色输出 ──────────────────────────────────────────────────────
class C:
    OK = "\033[92m"
    WARN = "\033[93m"
    ERR = "\033[91m"
    INFO = "\033[94m"
    BOLD = "\033[1m"
    END = "\033[0m"


def ok(msg: str) -> None:
    print(f"{C.OK}✓{C.END} {msg}")


def warn(msg: str) -> None:
    print(f"{C.WARN}⚠{C.END} {msg}")


def err(msg: str) -> None:
    print(f"{C.ERR}✗{C.END} {msg}", file=sys.stderr)


def info(msg: str) -> None:
    print(f"{C.INFO}→{C.END} {msg}")


def bold(msg: str) -> None:
    print(f"\n{C.BOLD}{msg}{C.END}")


# ── 路径工具 ──────────────────────────────────────────────────────
def get_main_repo() -> Path:
    """返回主仓库根目录（脚本所在目录的父目录）"""
    script_dir = Path(__file__).resolve().parent
    return script_dir


def get_subrepo_dir(main: Path | None = None) -> Path:
    return (main or get_main_repo()) / ".subrepo" / SUBREPO_NAME


# ── Git 工具 ──────────────────────────────────────────────────────
def run_git(cmd: list[str], cwd: Path, check: bool = True, capture: bool = False) -> str:
    """在指定目录运行 git 命令"""
    full_cmd = ["git"] + cmd
    if capture:
        result = subprocess.run(full_cmd, cwd=cwd, capture_output=True, text=True, check=check)
        return result.stdout.strip()
    subprocess.run(full_cmd, cwd=cwd, check=check)
    return ""


def git_has_changes(cwd: Path) -> bool:
    """检查工作区是否有未暂存/未提交的更改"""
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=cwd, capture_output=True, text=True, check=True
    )
    return bool(result.stdout.strip())


def git_branch(cwd: Path) -> str:
    return run_git(["branch", "--show-current"], cwd, capture=True)


def git_remote_url(cwd: Path) -> str:
    try:
        return run_git(["remote", "get-url", "origin"], cwd, capture=True)
    except subprocess.CalledProcessError:
        return "(no remote)"


def git_latest_commit(cwd: Path, short: bool = True) -> str:
    fmt = "%h" if short else "%H"
    return run_git(["log", "-1", f"--format={fmt}"], cwd, capture=True)


# ── 文件同步 ──────────────────────────────────────────────────────
def is_ignored_for_main(path: Path, main_repo: Path) -> bool:
    """判断路径是否属于主仓库应忽略的内容"""
    try:
        rel = path.relative_to(main_repo)
    except ValueError:
        return False
    rel_str = str(rel).replace("\\", "/")
    for ignored in MAIN_IGNORED:
        if rel_str == ignored or rel_str.startswith(ignored + "/"):
            return True
    return False


def copy_tree(src: Path, dst: Path) -> None:
    """递归复制目录，dst 存在则先删除"""
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def sync_main_to_subrepo(main_repo: Path, subrepo: Path) -> None:
    """将主仓库的 content/docs 和 assets 同步到子仓库"""
    for main_rel, sub_rel in SYNC_PAIRS:
        src = main_repo / main_rel
        dst = subrepo / sub_rel
        if src.exists():
            copy_tree(src, dst)
        else:
            warn(f"Source not found: {src}")


def sync_subrepo_to_main(subrepo: Path, main_repo: Path) -> None:
    """将子仓库内容同步回主仓库"""
    for main_rel, sub_rel in SYNC_PAIRS:
        src = subrepo / sub_rel
        dst = main_repo / main_rel
        if src.exists():
            copy_tree(src, dst)
        else:
            warn(f"Source not found in subrepo: {src}")


def dir_diff_summary(left: Path, right: Path) -> tuple[int, int, int]:
    """
    快速比较两个目录的差异。
    返回: (仅在左侧, 仅在右侧, 内容不同)
    """
    if not left.exists() or not right.exists():
        return (0, 0, 0)

    cmp = filecmp.dircmp(left, right)
    only_left = len(cmp.left_only)
    only_right = len(cmp.right_only)
    diff_files = len(cmp.diff_files)

    # 递归统计子目录
    for sub in cmp.subdirs.values():
        ol, or_, df = dir_diff_summary(Path(sub.left), Path(sub.right))
        only_left += ol
        only_right += or_
        diff_files += df

    return only_left, only_right, diff_files


# ── 交互式输入 ────────────────────────────────────────────────────
def ask_yes_no(prompt: str, default: bool = False) -> bool:
    suffix = " [Y/n] " if default else " [y/N] "
    answer = input(f"{prompt}{suffix}").strip().lower()
    if not answer:
        return default
    return answer in ("y", "yes")


def ask_input(prompt: str, required: bool = True) -> str:
    while True:
        value = input(f"{prompt}: ").strip()
        if value or not required:
            return value
        print("  输入不能为空，请重试。")


# ── 命令实现 ──────────────────────────────────────────────────────
def cmd_init(args: argparse.Namespace) -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)

    bold("初始化 AstroBox Docs 工作区")
    info(f"主仓库: {main_repo}")
    info(f"子仓库本地路径: {subrepo}")

    if subrepo.exists():
        warn("子仓库目录已存在，跳过 clone。")
    else:
        subrepo.parent.mkdir(parents=True, exist_ok=True)
        info("正在 clone 内容子仓库...")
        run_git(["clone", SUBREPO_URL, str(subrepo)], cwd=main_repo)
        ok(f"子仓库已克隆到 {subrepo}")

    # 将子仓库内容同步到主仓库（确保主仓库有文件）
    info("正在将子仓库内容同步到主仓库...")
    sync_subrepo_to_main(subrepo, main_repo)
    ok("内容已同步到主仓库")

    print("\n" + "=" * 50)
    ok("初始化完成！")
    print("  你现在可以编辑 content/docs 和 public/assets/images/docs 下的文件")
    print("  编辑完成后运行: python abdocstool.py commit")
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)

    bold("📦 主仓库状态")
    info(f"路径: {main_repo}")
    info(f"分支: {git_branch(main_repo)}")
    info(f"远程: {git_remote_url(main_repo)}")
    info(f"最新提交: {git_latest_commit(main_repo)}")

    if git_has_changes(main_repo):
        print(f"\n{C.WARN}未提交的更改:{C.END}")
        run_git(["status", "-sb"], cwd=main_repo, check=True)
    else:
        ok("工作区干净")

    bold("📄 内容子仓库状态")
    if not subrepo.exists():
        err("子仓库未初始化，请先运行: python abdocstool.py init")
        return 1

    info(f"路径: {subrepo}")
    info(f"分支: {git_branch(subrepo)}")
    info(f"远程: {git_remote_url(subrepo)}")
    info(f"最新提交: {git_latest_commit(subrepo)}")

    if git_has_changes(subrepo):
        print(f"\n{C.WARN}未提交的更改:{C.END}")
        run_git(["status", "-sb"], cwd=subrepo, check=True)
    else:
        ok("工作区干净")

    bold("🔄 主仓库 ↔ 子仓库 文件差异")
    for main_rel, sub_rel in SYNC_PAIRS:
        left = main_repo / main_rel
        right = subrepo / sub_rel
        if not left.exists() or not right.exists():
            warn(f"{main_rel}: 目录不存在，无法比较")
            continue
        ol, or_, df = dir_diff_summary(left, right)
        total = ol + or_ + df
        if total == 0:
            ok(f"{main_rel}: 完全一致")
        else:
            warn(f"{main_rel}: 有 {total} 处差异 "
                 f"(仅主仓库 {ol}, 仅子仓库 {or_}, 内容不同 {df})")

    return 0


def cmd_commit(args: argparse.Namespace) -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)

    if not subrepo.exists():
        err("子仓库未初始化，请先运行: python abdocstool.py init")
        return 1

    bold("提交向导")

    # ── 主仓库提交 ──
    main_has = git_has_changes(main_repo)
    if main_has:
        print(f"\n{C.INFO}主仓库有未提交的更改:{C.END}")
        run_git(["status", "-sb"], cwd=main_repo, check=True)
        if ask_yes_no("是否提交主仓库更改？", default=False):
            msg = ask_input("主仓库提交信息")
            run_git(["add", "-A"], cwd=main_repo)
            run_git(["commit", "-m", msg], cwd=main_repo)
            ok("主仓库已提交")
        else:
            info("跳过主仓库提交")
    else:
        ok("主仓库无更改")

    # ── 内容仓库提交 ──
    # 先将主仓库内容同步到子仓库
    sync_main_to_subrepo(main_repo, subrepo)
    content_has = git_has_changes(subrepo)

    if content_has:
        print(f"\n{C.INFO}内容仓库有未提交的更改:{C.END}")
        run_git(["status", "-sb"], cwd=subrepo, check=True)
        if ask_yes_no("是否提交内容仓库更改？", default=False):
            msg = ask_input("内容仓库提交信息")
            run_git(["add", "-A"], cwd=subrepo)
            run_git(["commit", "-m", msg], cwd=subrepo)
            ok("内容仓库已提交")
        else:
            info("跳过内容仓库提交")
    else:
        ok("内容仓库无更改（与主仓库一致）")

    return 0


def cmd_sync(args: argparse.Namespace) -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)

    if not subrepo.exists():
        err("子仓库未初始化，请先运行: python abdocstool.py init")
        return 1

    bold("同步内容仓库到主仓库")

    info("正在拉取子仓库最新内容...")
    run_git(["fetch", "origin"], cwd=subrepo)

    local_branch = git_branch(subrepo)
    run_git(["reset", "--hard", f"origin/{local_branch}"], cwd=subrepo)
    ok(f"子仓库已同步到 origin/{local_branch}")

    info("正在将最新内容复制到主仓库...")
    sync_subrepo_to_main(subrepo, main_repo)
    ok("主仓库内容已更新")

    print("\n提示: 如果主仓库的 content/docs 之前有未保存的本地修改，它们已被覆盖。")
    print("      如需保留，请先从 git 历史或备份中恢复。")
    return 0


def cmd_push(args: argparse.Namespace) -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)

    if not subrepo.exists():
        err("子仓库未初始化，请先运行: python abdocstool.py init")
        return 1

    bold("推送向导")

    # 主仓库
    main_branch = git_branch(main_repo)
    if ask_yes_no(f"推送主仓库 ({main_branch})？", default=True):
        run_git(["push", "origin", main_branch], cwd=main_repo)
        ok("主仓库已推送")
    else:
        info("跳过主仓库推送")

    # 内容仓库
    sub_branch = git_branch(subrepo)
    if ask_yes_no(f"推送内容仓库 ({sub_branch})？", default=True):
        run_git(["push", "origin", sub_branch], cwd=subrepo)
        ok("内容仓库已推送")
    else:
        info("跳过内容仓库推送")

    return 0


# ── 入口 ──────────────────────────────────────────────────────────
def main() -> int:
    parser = argparse.ArgumentParser(
        prog="abdocstool.py",
        description="AstroBox Docs 主仓库与内容子仓库的同步管理工具",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="首次初始化，clone 子仓库并同步内容")
    sub.add_parser("status", help="查看两个仓库的当前状态与差异")
    sub.add_parser("commit", help="交互式分别提交主仓库和内容仓库")
    sub.add_parser("sync", help="从远程拉取内容仓库最新内容到本地")
    sub.add_parser("push", help="推送两个仓库到远程")

    args = parser.parse_args()

    handlers: dict[str, callable] = {
        "init": cmd_init,
        "status": cmd_status,
        "commit": cmd_commit,
        "sync": cmd_sync,
        "push": cmd_push,
    }

    try:
        return handlers[args.command](args)
    except subprocess.CalledProcessError as e:
        err(f"命令执行失败: {e}")
        return 1
    except KeyboardInterrupt:
        print("\n\n已取消操作")
        return 130


if __name__ == "__main__":
    sys.exit(main())
