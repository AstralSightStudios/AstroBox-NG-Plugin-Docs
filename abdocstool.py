#!/usr/bin/env python3
"""
AstroBox Docs Tool — 交互式 TUI 双仓库管理器 / CLI

直接运行（TUI）: python abdocstool.py

操作:
    ↑ / ↓      切换菜单
    Enter      执行选中项
    Mouse      点击菜单项（支持滚轮）
    q / ESC    退出

命令行模式:
    python abdocstool.py commit -m "提交信息" --push
    python abdocstool.py push
    python abdocstool.py status
    python abdocstool.py sync
    python abdocstool.py init
"""

from __future__ import annotations

import argparse
import curses
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Callable

# ── 配置 ──────────────────────────────────────────────────────────
SUBREPO_URL = "https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Docs-Content.git"
SUBREPO_NAME = "AstroBox-NG-Plugin-Docs-Content"

SYNC_PAIRS: list[tuple[str, str]] = [
    ("content/docs", "content/docs"),
    ("public/assets/images/docs", "public/assets/images/docs"),
]

# ── 路径工具 ──────────────────────────────────────────────────────
def get_main_repo() -> Path:
    return Path(__file__).resolve().parent


def get_subrepo_dir(main: Path | None = None) -> Path:
    return (main or get_main_repo()) / ".subrepo" / SUBREPO_NAME


# ── Git 工具 ──────────────────────────────────────────────────────
def run_git(cmd: list[str], cwd: Path, check: bool = True, capture: bool = False) -> str:
    full_cmd = ["git"] + cmd
    if capture:
        result = subprocess.run(full_cmd, cwd=cwd, capture_output=True, text=True, check=check)
        return result.stdout.strip()
    subprocess.run(full_cmd, cwd=cwd, check=check)
    return ""


def git_has_changes(cwd: Path) -> bool:
    result = subprocess.run(
        ["git", "status", "--porcelain"], cwd=cwd,
        capture_output=True, text=True, check=True
    )
    return bool(result.stdout.strip())


def git_branch(cwd: Path) -> str:
    try:
        return run_git(["branch", "--show-current"], cwd, capture=True)
    except subprocess.CalledProcessError:
        return "unknown"


def git_latest_commit(cwd: Path, short: bool = True) -> str:
    try:
        fmt = "%h" if short else "%H"
        return run_git(["log", "-1", f"--format={fmt}"], cwd, capture=True)
    except subprocess.CalledProcessError:
        return "unknown"


def git_remote_url(cwd: Path) -> str:
    try:
        return run_git(["remote", "get-url", "origin"], cwd, capture=True)
    except subprocess.CalledProcessError:
        return "(no remote)"


# ── 文件同步 ──────────────────────────────────────────────────────
def copy_tree(src: Path, dst: Path) -> None:
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def sync_main_to_subrepo(main_repo: Path, subrepo: Path) -> None:
    for main_rel, sub_rel in SYNC_PAIRS:
        src = main_repo / main_rel
        dst = subrepo / sub_rel
        if src.exists():
            copy_tree(src, dst)


def sync_subrepo_to_main(subrepo: Path, main_repo: Path) -> None:
    for main_rel, sub_rel in SYNC_PAIRS:
        src = subrepo / sub_rel
        dst = main_repo / main_rel
        if src.exists():
            copy_tree(src, dst)


# ── TUI 常量 ──────────────────────────────────────────────────────
ASCII_LOGO = [
    "    ___         __             ____             __  ____         ___          __  ",
    "   /   | __  __/ /_____       / __ )____ ______/ /_/ __ )__  __ / (_)_______/ /__",
    "  / /| |/ / / / __/ __ \     / __  / __ `/ ___/ __/ __  / / / // / / ___/ //_/",
    " / ___ / /_/ / /_/ /_/ /    / /_/ / /_/ (__  ) /_/ /_/ / /_/ // / / /__/ ,<    ",
    "/_/  |_\__,_/\__/\____/    /_____/\__,_/____/\__/_____/\__,_// /_/\___/_/|_|   ",
    "                                                          /___/                ",
]

# 预定义的配色对
CP_LOGO = 1
CP_TITLE = 2
CP_CARD_BORDER = 3
CP_CARD_TITLE = 4
CP_CARD_TEXT = 5
CP_CARD_OK = 6
CP_CARD_WARN = 7
CP_MENU_NORMAL = 8
CP_MENU_SELECTED = 9
CP_MENU_HOTKEY = 10
CP_FOOTER = 11
CP_EASTER_EGG = 12
CP_STATUS_BAR = 13

# 菜单项
MENU_ITEMS = [
    ("📝  Commit", "commit", "分别提交主仓库和内容仓库"),
    ("🔄  Sync", "sync", "从远程拉取内容仓库最新内容"),
    ("📤  Push", "push", "推送两个仓库到远程"),
    ("ℹ️   Status", "status", "显示详细状态信息"),
    ("🔧  Init", "init", "初始化/重新同步子仓库"),
    ("🚪  Exit", "exit", "退出工具"),
]


# ── Curses 辅助 ───────────────────────────────────────────────────
def safe_addstr(stdscr, y: int, x: int, text: str, attr: int = 0) -> None:
    """安全地绘制字符串，超出边界不报错"""
    try:
        height, width = stdscr.getmaxyx()
        if y < 0 or y >= height or x >= width:
            return
        if x < 0:
            text = text[-x:]
            x = 0
        if len(text) > width - x:
            text = text[:width - x - 1]
        if text:
            stdscr.addstr(y, x, text, attr)
    except curses.error:
        pass


def draw_box(stdscr, top: int, left: int, height: int, width: int, title: str = "") -> None:
    """绘制一个带标题的边框"""
    # 顶边
    safe_addstr(stdscr, top, left, "┌" + "─" * (width - 2) + "┐", curses.color_pair(CP_CARD_BORDER))
    # 标题
    if title:
        title_x = left + (width - len(title)) // 2
        safe_addstr(stdscr, top, title_x, title, curses.color_pair(CP_CARD_TITLE) | curses.A_BOLD)
    # 左右边
    for y in range(top + 1, top + height - 1):
        safe_addstr(stdscr, y, left, "│", curses.color_pair(CP_CARD_BORDER))
        safe_addstr(stdscr, y, left + width - 1, "│", curses.color_pair(CP_CARD_BORDER))
    # 底边
    safe_addstr(stdscr, top + height - 1, left, "└" + "─" * (width - 2) + "┘", curses.color_pair(CP_CARD_BORDER))


def draw_horizontal_line(stdscr, y: int, x: int, width: int, char: str = "─") -> None:
    safe_addstr(stdscr, y, x, char * width, curses.color_pair(CP_CARD_BORDER))


# ── 动画效果 ──────────────────────────────────────────────────────
def typewriter_effect(stdscr, y: int, x: int, text: str, delay: float = 0.01, attr: int = 0) -> None:
    """打字机效果显示文字"""
    for i, ch in enumerate(text):
        safe_addstr(stdscr, y, x + i, ch, attr)
        stdscr.refresh()
        time.sleep(delay)


def fade_in_logo(stdscr, logo_lines: list[str], start_y: int, start_x: int) -> None:
    """Logo 渐显效果"""
    for i, line in enumerate(logo_lines):
        safe_addstr(stdscr, start_y + i, start_x, line, curses.color_pair(CP_LOGO))
        stdscr.refresh()
        time.sleep(0.05)


# ── 状态收集 ──────────────────────────────────────────────────────
class RepoStatus:
    def __init__(self, path: Path, name: str):
        self.path = path
        self.name = name
        self.exists = path.exists() and (path / ".git").exists()
        self.branch = ""
        self.commit = ""
        self.remote = ""
        self.has_changes = False
        if self.exists:
            self.branch = git_branch(path)
            self.commit = git_latest_commit(path)
            self.remote = git_remote_url(path)
            self.has_changes = git_has_changes(path)


def collect_status() -> tuple[RepoStatus, RepoStatus]:
    main = get_main_repo()
    sub = get_subrepo_dir(main)
    return RepoStatus(main, "Main Repo"), RepoStatus(sub, "Content Repo")


# ── 主 TUI ────────────────────────────────────────────────────────
def init_colors() -> None:
    """初始化所有颜色对"""
    curses.start_color()
    curses.use_default_colors()
    
    # Logo: 青色
    curses.init_pair(CP_LOGO, curses.COLOR_CYAN, -1)
    # Title: 白色加亮
    curses.init_pair(CP_TITLE, curses.COLOR_WHITE, -1)
    # Card border: 暗灰
    curses.init_pair(CP_CARD_BORDER, 8, -1)
    # Card title: 黄色
    curses.init_pair(CP_CARD_TITLE, curses.COLOR_YELLOW, -1)
    # Card text: 白色
    curses.init_pair(CP_CARD_TEXT, curses.COLOR_WHITE, -1)
    # OK: 绿色
    curses.init_pair(CP_CARD_OK, curses.COLOR_GREEN, -1)
    # Warn: 黄色
    curses.init_pair(CP_CARD_WARN, curses.COLOR_YELLOW, -1)
    # Menu normal: 白色
    curses.init_pair(CP_MENU_NORMAL, curses.COLOR_WHITE, -1)
    # Menu selected: 黑底白字（高亮）
    curses.init_pair(CP_MENU_SELECTED, curses.COLOR_BLACK, curses.COLOR_WHITE)
    # Hotkey: 青色
    curses.init_pair(CP_MENU_HOTKEY, curses.COLOR_CYAN, -1)
    # Footer: 暗灰
    curses.init_pair(CP_FOOTER, 8, -1)
    # Easter egg: 洋红
    curses.init_pair(CP_EASTER_EGG, curses.COLOR_MAGENTA, -1)
    # Status bar: 黑底青字
    curses.init_pair(CP_STATUS_BAR, curses.COLOR_CYAN, curses.COLOR_BLACK)


def draw_repo_card(stdscr, y: int, x: int, width: int, status: RepoStatus) -> None:
    """绘制仓库状态卡片"""
    lines = [
        f"  Branch: {status.branch}",
        f"  Commit: {status.commit}",
        f"  Remote: {status.remote[:width-10]}",
    ]
    
    if not status.exists:
        lines.append("  Status: Not initialized")
        status_color = CP_CARD_WARN
    elif status.has_changes:
        lines.append("  Status: Has uncommitted changes")
        status_color = CP_CARD_WARN
    else:
        lines.append("  Status: Clean")
        status_color = CP_CARD_OK
    
    height = len(lines) + 4
    
    # 绘制边框
    draw_box(stdscr, y, x, height, width, f" {status.name} ")
    
    # 绘制内容
    for i, line in enumerate(lines):
        if "Status:" in line:
            color = curses.color_pair(status_color) | curses.A_BOLD
        else:
            color = curses.color_pair(CP_CARD_TEXT)
        safe_addstr(stdscr, y + 2 + i, x + 1, line, color)


def draw_menu(stdscr, y: int, x: int, width: int, selected: int) -> None:
    """绘制可选择的菜单"""
    menu_height = len(MENU_ITEMS) + 2
    
    # 绘制边框
    draw_box(stdscr, y, x, menu_height, width, " Actions ")
    
    # 绘制菜单项
    for i, (label, key, desc) in enumerate(MENU_ITEMS):
        item_y = y + 1 + i
        is_selected = i == selected
        
        if is_selected:
            # 选中项：反色 + 粗体 + 指示器
            bg_attr = curses.color_pair(CP_MENU_SELECTED) | curses.A_BOLD
            safe_addstr(stdscr, item_y, x + 1, " " * (width - 2), bg_attr)
            safe_addstr(stdscr, item_y, x + 3, f"▸ {label}", bg_attr)
            
            # 在底部显示描述
            draw_status_bar(stdscr, desc)
        else:
            normal_attr = curses.color_pair(CP_MENU_NORMAL)
            safe_addstr(stdscr, item_y, x + 3, f"  {label}", normal_attr)


def draw_status_bar(stdscr, message: str) -> None:
    """在底部绘制状态栏"""
    height, width = stdscr.getmaxyx()
    bar_y = height - 1
    
    # 清空状态栏
    safe_addstr(stdscr, bar_y, 0, " " * (width - 1), curses.color_pair(CP_STATUS_BAR))
    # 绘制消息
    safe_addstr(stdscr, bar_y, 2, message[:width-4], curses.color_pair(CP_STATUS_BAR))


def draw_footer(stdscr) -> None:
    """绘制底部快捷键提示"""
    height, width = stdscr.getmaxyx()
    footer_y = height - 2
    
    hints = "[↑↓] Navigate  [Enter] Execute  [Mouse] Click  [q] Exit"
    x = max(0, (width - len(hints)) // 2)
    safe_addstr(stdscr, footer_y, x, hints, curses.color_pair(CP_FOOTER))


def draw_easter_egg(stdscr) -> None:
    """彩蛋：根据时间显示不同的问候"""
    hour = time.localtime().tm_hour
    height, width = stdscr.getmaxyx()
    
    if 5 <= hour < 12:
        greeting = "☀️  Good morning, space explorer!"
    elif 12 <= hour < 18:
        greeting = "🌤  Good afternoon, stargazer!"
    elif 18 <= hour < 22:
        greeting = "🌙  Good evening, astronaut!"
    else:
        greeting = "⭐ The stars are watching you code..."
    
    x = max(0, (width - len(greeting)) // 2)
    safe_addstr(stdscr, 1, x, greeting, curses.color_pair(CP_EASTER_EGG))


def run_command(stdscr, title: str, fn: Callable[[], int]) -> int:
    """执行命令并显示结果"""
    curses.endwin()
    
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")
    
    try:
        result = fn()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        result = 1
    
    print(f"\n{'='*60}")
    input("\nPress Enter to return to AstroBox Docs Tool...")
    
    # 重新初始化 curses
    stdscr = curses.initscr()
    curses.noecho()
    curses.cbreak()
    stdscr.keypad(True)
    curses.curs_set(0)
    if curses.has_colors():
        init_colors()
    
    return result


# ── 命令实现 ──────────────────────────────────────────────────────
def do_init() -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)
    
    print("🚀 Initializing AstroBox Docs workspace...\n")
    print(f"Main repo: {main_repo}")
    print(f"Subrepo path: {subrepo}\n")
    
    if subrepo.exists():
        print("⚠️  Subrepo already exists, re-syncing...")
    else:
        subrepo.parent.mkdir(parents=True, exist_ok=True)
        print("📦 Cloning content sub-repo...")
        run_git(["clone", SUBREPO_URL, str(subrepo)], cwd=main_repo)
        print("✅ Subrepo cloned")
    
    print("\n🔄 Syncing content to main repo...")
    sync_subrepo_to_main(subrepo, main_repo)
    print("✅ Content synced!")

    # Install dependencies if needed
    node_modules = main_repo / "node_modules"
    if not node_modules.exists():
        print("\n📦 node_modules not found, running pnpm install...")
        subprocess.run(["pnpm", "install"], cwd=main_repo, check=True)
        print("✅ Dependencies installed!")
    else:
        print("\n✅ node_modules already exists, skipping pnpm install")

    print("\n🎉 Initialization complete!")
    print("   You can now run: pnpm dev")
    return 0


def do_commit(main_message: str | None = None, content_message: str | None = None, auto_push: bool = False, main_files: list[str] | None = None) -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)
    
    if not subrepo.exists():
        print("❌ Subrepo not initialized. Please run 'Init' first.")
        return 1
    
    print("📝 Commit Wizard\n")
    
    # Main repo
    if git_has_changes(main_repo):
        print("📦 Main repo has changes:")
        run_git(["status", "-sb"], cwd=main_repo)
        if main_message is not None:
            if main_files:
                for f in main_files:
                    run_git(["add", f], cwd=main_repo)
            else:
                run_git(["add", "-A"], cwd=main_repo)
            run_git(["commit", "-m", main_message], cwd=main_repo)
            print("✅ Main repo committed")
        else:
            ans = input("\nCommit main repo? [y/N] ").strip().lower()
            if ans in ("y", "yes"):
                msg = input("Commit message: ").strip()
                if msg:
                    run_git(["add", "-A"], cwd=main_repo)
                    run_git(["commit", "-m", msg], cwd=main_repo)
                    print("✅ Main repo committed")
    else:
        print("✅ Main repo: clean")
    
    # Content repo
    sync_main_to_subrepo(main_repo, subrepo)
    if git_has_changes(subrepo):
        print("\n📄 Content repo has changes:")
        run_git(["status", "-sb"], cwd=subrepo)
        if content_message is not None:
            run_git(["add", "-A"], cwd=subrepo)
            run_git(["commit", "-m", content_message], cwd=subrepo)
            print("✅ Content repo committed")
        else:
            ans = input("\nCommit content repo? [y/N] ").strip().lower()
            if ans in ("y", "yes"):
                msg = input("Commit message: ").strip()
                if msg:
                    run_git(["add", "-A"], cwd=subrepo)
                    run_git(["commit", "-m", msg], cwd=subrepo)
                    print("✅ Content repo committed")
    else:
        print("✅ Content repo: clean")
    
    if auto_push:
        return do_push(auto_confirm=True)
    return 0


def do_sync() -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)
    
    if not subrepo.exists():
        print("❌ Subrepo not initialized. Please run 'Init' first.")
        return 1
    
    print("🔄 Syncing from remote...\n")
    
    run_git(["fetch", "origin"], cwd=subrepo)
    branch = git_branch(subrepo)
    run_git(["reset", "--hard", f"origin/{branch}"], cwd=subrepo)
    print(f"✅ Subrepo synced to origin/{branch}")
    
    print("\n🔄 Copying to main repo...")
    sync_subrepo_to_main(subrepo, main_repo)
    print("✅ Main repo updated!")
    
    print("\n⚠️  Warning: Local changes in content/docs have been overwritten.")
    return 0


def do_push(auto_confirm: bool = False) -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)
    
    if not subrepo.exists():
        print("❌ Subrepo not initialized. Please run 'Init' first.")
        return 1
    
    print("📤 Push Wizard\n")
    
    main_branch = git_branch(main_repo)
    sub_branch = git_branch(subrepo)
    
    if auto_confirm:
        run_git(["push", "origin", main_branch], cwd=main_repo)
        print("✅ Main repo pushed")
        run_git(["push", "origin", sub_branch], cwd=subrepo)
        print("✅ Content repo pushed")
    else:
        ans = input(f"Push main repo ({main_branch})? [Y/n] ").strip().lower()
        if ans in ("", "y", "yes"):
            run_git(["push", "origin", main_branch], cwd=main_repo)
            print("✅ Main repo pushed")
        
        ans = input(f"\nPush content repo ({sub_branch})? [Y/n] ").strip().lower()
        if ans in ("", "y", "yes"):
            run_git(["push", "origin", sub_branch], cwd=subrepo)
            print("✅ Content repo pushed")
    
    return 0


def do_status() -> int:
    main_repo = get_main_repo()
    subrepo = get_subrepo_dir(main_repo)
    
    print("📊 Detailed Status\n")
    
    print("─" * 50)
    print("📦 Main Repo")
    print("─" * 50)
    print(f"  Path:   {main_repo}")
    print(f"  Branch: {git_branch(main_repo)}")
    print(f"  Commit: {git_latest_commit(main_repo)}")
    print(f"  Remote: {git_remote_url(main_repo)}")
    print(f"  Clean:  {'✅ Yes' if not git_has_changes(main_repo) else '⚠️  No'}")
    
    if subrepo.exists():
        print("\n" + "─" * 50)
        print("📄 Content Repo")
        print("─" * 50)
        print(f"  Path:   {subrepo}")
        print(f"  Branch: {git_branch(subrepo)}")
        print(f"  Commit: {git_latest_commit(subrepo)}")
        print(f"  Remote: {git_remote_url(subrepo)}")
        print(f"  Clean:  {'✅ Yes' if not git_has_changes(subrepo) else '⚠️  No'}")
    else:
        print("\n⚠️  Content repo not initialized")
    
    print()
    return 0


# ── 主循环 ────────────────────────────────────────────────────────
def main_tui(stdscr) -> int:
    # 初始化
    curses.curs_set(0)
    stdscr.nodelay(False)
    stdscr.timeout(100)
    
    if curses.has_colors():
        init_colors()
    
    # 启用鼠标支持
    curses.mousemask(curses.ALL_MOUSE_EVENTS | curses.REPORT_MOUSE_POSITION)
    
    selected = 0
    
    # 首次启动收集状态
    main_status, sub_status = collect_status()
    
    while True:
        stdscr.clear()
        height, width = stdscr.getmaxyx()
        
        # 最小尺寸检查
        if height < 20 or width < 60:
            stdscr.addstr(0, 0, "Terminal too small! Need at least 60x20")
            stdscr.refresh()
            key = stdscr.getch()
            if key == ord('q'):
                break
            continue
        
        # ═══════════════════════════════════════
        # 上部：Logo + 状态
        # ═══════════════════════════════════════
        
        # Logo
        logo_x = max(0, (width - len(ASCII_LOGO[0])) // 2)
        for i, line in enumerate(ASCII_LOGO):
            if i < height:
                safe_addstr(stdscr, i, logo_x, line, curses.color_pair(CP_LOGO))
        
        logo_height = len(ASCII_LOGO)
        
        # 彩蛋问候
        draw_easter_egg(stdscr)
        
        # 状态卡片
        card_y = logo_height + 1
        card_width = min(35, (width - 6) // 2)
        card_spacing = 4
        
        total_cards_width = card_width * 2 + card_spacing
        cards_start_x = max(0, (width - total_cards_width) // 2)
        
        draw_repo_card(stdscr, card_y, cards_start_x, card_width, main_status)
        draw_repo_card(stdscr, card_y, cards_start_x + card_width + card_spacing, card_width, sub_status)
        
        # 分隔线
        sep_y = card_y + 7
        draw_horizontal_line(stdscr, sep_y, 2, width - 4)
        
        # ═══════════════════════════════════════
        # 下部：菜单
        # ═══════════════════════════════════════
        
        menu_y = sep_y + 1
        menu_width = min(40, width - 4)
        menu_x = max(0, (width - menu_width) // 2)
        
        draw_menu(stdscr, menu_y, menu_x, menu_width, selected)
        
        # 底部提示
        draw_footer(stdscr)
        
        # 刷新
        stdscr.refresh()
        
        # ═══════════════════════════════════════
        # 输入处理
        # ═══════════════════════════════════════
        
        key = stdscr.getch()
        
        if key == -1:
            continue
        
        # 鼠标事件
        if key == curses.KEY_MOUSE:
            try:
                _, mx, my, _, bstate = curses.getmouse()
                
                # 检查是否点击在菜单区域内
                menu_start_y = menu_y + 1
                menu_end_y = menu_y + 1 + len(MENU_ITEMS)
                menu_start_x = menu_x + 3
                menu_end_x = menu_x + menu_width - 3
                
                if menu_start_y <= my < menu_end_y and menu_start_x <= mx < menu_end_x:
                    clicked_item = my - menu_start_y
                    if 0 <= clicked_item < len(MENU_ITEMS):
                        selected = clicked_item
                        stdscr.refresh()
                        
                        # 如果是单击（左键）
                        if bstate & curses.BUTTON1_CLICKED:
                            # 执行选中的命令
                            pass  # 继续到下面的 Enter 处理
                
                # 鼠标滚轮（兼容不同平台）
                scroll_up = getattr(curses, "BUTTON4_PRESSED", 0)
                scroll_down = getattr(curses, "BUTTON5_PRESSED", 0)
                if scroll_up and bstate & scroll_up:
                    selected = (selected - 1) % len(MENU_ITEMS)
                elif scroll_down and bstate & scroll_down:
                    selected = (selected + 1) % len(MENU_ITEMS)
                    
            except curses.error:
                pass
        
        # 键盘导航
        elif key in (curses.KEY_UP, ord('k')):
            selected = (selected - 1) % len(MENU_ITEMS)
        elif key in (curses.KEY_DOWN, ord('j')):
            selected = (selected + 1) % len(MENU_ITEMS)
        elif key == curses.KEY_HOME:
            selected = 0
        elif key == curses.KEY_END:
            selected = len(MENU_ITEMS) - 1
        elif key in (10, 13, curses.KEY_ENTER):  # Enter
            action = MENU_ITEMS[selected][1]
            
            if action == "exit":
                break
            elif action == "init":
                run_command(stdscr, "🚀 Initialize Subrepo", do_init)
            elif action == "commit":
                run_command(stdscr, "📝 Commit Changes", do_commit)
            elif action == "sync":
                run_command(stdscr, "🔄 Sync from Remote", do_sync)
            elif action == "push":
                run_command(stdscr, "📤 Push to Remote", do_push)
            elif action == "status":
                run_command(stdscr, "📊 Detailed Status", do_status)
            
            # 命令执行后重新收集状态
            main_status, sub_status = collect_status()
        
        elif key in (ord('q'), 27):  # q 或 ESC
            break
    
    return 0


def build_parser() -> argparse.ArgumentParser:
    """构建命令行参数解析器"""
    parser = argparse.ArgumentParser(
        prog="abdocstool.py",
        description="AstroBox Docs Tool — 交互式 TUI 双仓库管理器 / CLI",
    )
    subparsers = parser.add_subparsers(dest="command")

    commit_parser = subparsers.add_parser("commit", help="分别提交主仓库和内容仓库")
    commit_parser.add_argument(
        "-m", "--message",
        help="提交信息（同时用于主仓库和内容仓库，可被 --main-message / --content-message 覆盖）",
    )
    commit_parser.add_argument("--main-message", help="主仓库提交信息")
    commit_parser.add_argument("--content-message", help="内容仓库提交信息")
    commit_parser.add_argument("--push", action="store_true", help="提交后自动推送")
    commit_parser.add_argument(
        "--main-files",
        help="主仓库仅提交指定文件，逗号分隔（默认全部）",
    )

    subparsers.add_parser("push", help="推送两个仓库到远程")
    subparsers.add_parser("sync", help="从远程拉取内容仓库最新内容")
    subparsers.add_parser("init", help="初始化/重新同步子仓库")
    subparsers.add_parser("status", help="显示详细状态信息")

    return parser


def run_cli(args: argparse.Namespace) -> int:
    """运行命令行模式"""
    if args.command == "commit":
        main_msg = args.main_message or args.message
        content_msg = args.content_message or args.message
        main_files = None
        if args.main_files:
            main_files = [f.strip() for f in args.main_files.split(",") if f.strip()]
        return do_commit(
            main_message=main_msg,
            content_message=content_msg,
            auto_push=args.push,
            main_files=main_files,
        )
    elif args.command == "push":
        return do_push(auto_confirm=True)
    elif args.command == "sync":
        return do_sync()
    elif args.command == "init":
        return do_init()
    elif args.command == "status":
        return do_status()
    else:
        print("请指定命令。使用 --help 查看帮助。")
        return 1


def main() -> int:
    # 命令行模式：带参数
    if len(sys.argv) > 1:
        parser = build_parser()
        args = parser.parse_args()
        return run_cli(args)

    # TUI 模式：检测是否在真正的 TTY 终端中运行
    if not sys.stdin.isatty() or not sys.stdout.isatty():
        print("❌ abdocstool.py requires an interactive terminal (TTY).")
        print("   Please run it directly in your terminal:")
        print("   python abdocstool.py")
        return 1

    try:
        return curses.wrapper(main_tui)
    except curses.error as e:
        print(f"\n❌ Terminal error: {e}")
        print("   Make sure your terminal supports curses (e.g., iTerm2, Terminal.app)")
        return 1
    except KeyboardInterrupt:
        print("\n\n👋 See you, space cowboy!")
        return 0


if __name__ == "__main__":
    sys.exit(main())
