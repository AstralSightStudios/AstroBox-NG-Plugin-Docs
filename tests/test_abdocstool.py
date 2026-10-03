import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import abdocstool


def run_git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", *args], cwd=repo, check=True, capture_output=True, text=True
    )
    return result.stdout.strip()


def init_repo(repo: Path, files: dict[str, str]) -> None:
    repo.mkdir(parents=True, exist_ok=True)
    run_git(repo, "init", "-q")
    run_git(repo, "config", "user.name", "Test User")
    run_git(repo, "config", "user.email", "test@example.com")
    for name, content in files.items():
        path = repo / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
    run_git(repo, "add", "-A")
    run_git(repo, "commit", "-qm", "初始化")


class SelectiveContentCommitTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.main = Path(self.temp.name) / "main"
        self.subrepo = self.main / ".subrepo" / "AstroBox-NG-Plugin-Docs-Content"

        init_repo(
            self.main,
            {
                ".gitignore": "content/\n.subrepo/\n",
                "README.md": "原始内容\n",
            },
        )
        init_repo(
            self.subrepo,
            {
                "content/docs/unrelated.md": "子仓文档\n",
                "content/blog/kept.mdx": "子仓博客\n",
            },
        )

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_content_only_commit_preserves_unselected_content_and_main_changes(self) -> None:
        main_head = run_git(self.main, "rev-parse", "HEAD")
        (self.main / "README.md").write_text("用户未提交的主仓改动\n")
        (self.main / "content/docs/unrelated.md").parent.mkdir(parents=True, exist_ok=True)
        (self.main / "content/docs/unrelated.md").write_text("主仓本地文档改动\n")
        (self.main / "content/blog/kept.mdx").parent.mkdir(parents=True, exist_ok=True)
        (self.main / "content/blog/kept.mdx").write_text("主仓本地博客改动\n")
        article = self.main / "content/blog/2p2.mdx"
        article.write_text("AstroBox 2.2\n")

        with patch.object(abdocstool, "get_main_repo", return_value=self.main):
            result = abdocstool.do_commit(
                content_message="新增 AstroBox 2.2 发布博客",
                content_files=["content/blog/2p2.mdx"],
            )

        self.assertEqual(result, 0)
        self.assertEqual(
            (self.subrepo / "content/blog/2p2.mdx").read_text(), "AstroBox 2.2\n"
        )
        self.assertEqual(
            (self.subrepo / "content/docs/unrelated.md").read_text(), "子仓文档\n"
        )
        self.assertEqual(
            (self.subrepo / "content/blog/kept.mdx").read_text(), "子仓博客\n"
        )
        self.assertEqual(run_git(self.subrepo, "log", "-1", "--format=%s"), "新增 AstroBox 2.2 发布博客")
        self.assertEqual(run_git(self.main, "rev-parse", "HEAD"), main_head)
        self.assertIn("README.md", run_git(self.main, "status", "--short"))
        self.assertEqual(run_git(self.subrepo, "status", "--porcelain"), "")

    def test_content_file_paths_must_be_inside_managed_roots(self) -> None:
        with self.assertRaises(ValueError):
            abdocstool.validate_content_files(["../README.md"])
        with self.assertRaises(ValueError):
            abdocstool.validate_content_files(["README.md"])

    def test_selected_sync_does_not_modify_a_hard_link_target(self) -> None:
        outside = Path(self.temp.name) / "outside.txt"
        outside.write_text("外部原内容\n")
        destination = self.subrepo / "content/blog/2p2.mdx"
        destination.parent.mkdir(parents=True, exist_ok=True)
        os.link(outside, destination)
        source = self.main / "content/blog/2p2.mdx"
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text("AstroBox 2.2\n")

        abdocstool.sync_selected_content(
            self.main, self.subrepo, ["content/blog/2p2.mdx"]
        )

        self.assertEqual(outside.read_text(), "外部原内容\n")
        self.assertEqual(destination.read_text(), "AstroBox 2.2\n")
        self.assertNotEqual(outside.stat().st_ino, destination.stat().st_ino)

    def test_selected_paths_reject_a_symlink_subrepo_root(self) -> None:
        article = self.main / "content/blog/2p2.mdx"
        article.parent.mkdir(parents=True, exist_ok=True)
        article.write_text("AstroBox 2.2\n")
        external = Path(self.temp.name) / "external-content"
        init_repo(external, {"content/blog/2p2.mdx": "外部仓库文件\n"})
        real_subrepo = self.subrepo.with_name("real-content")
        self.subrepo.rename(real_subrepo)
        self.subrepo.symlink_to(external, target_is_directory=True)

        with self.assertRaises(ValueError):
            abdocstool.validate_selected_content_paths(
                self.main, self.subrepo, ["content/blog/2p2.mdx"]
            )

    def test_selected_paths_reject_a_symlink_subrepo_parent(self) -> None:
        article = self.main / "content/blog/2p2.mdx"
        article.parent.mkdir(parents=True, exist_ok=True)
        article.write_text("AstroBox 2.2\n")
        real_parent = self.subrepo.parent.with_name(".subrepo-real")
        self.subrepo.parent.rename(real_parent)
        self.subrepo.parent.symlink_to(real_parent, target_is_directory=True)

        with self.assertRaises(ValueError):
            abdocstool.validate_selected_content_paths(
                self.main, self.subrepo, ["content/blog/2p2.mdx"]
            )

    def test_cli_selective_mode_passes_content_paths_without_main_commit(self) -> None:
        args = abdocstool.build_parser().parse_args(
            [
                "commit",
                "-m",
                "只提交博客",
                "--content-files",
                "content/blog/2p2.mdx, public/assets/images/blog/2p2.jpg",
            ]
        )

        with patch.object(abdocstool, "do_commit", return_value=0) as commit:
            result = abdocstool.run_cli(args)

        self.assertEqual(result, 0)
        commit.assert_called_once_with(
            main_message=None,
            content_message="只提交博客",
            auto_push=False,
            main_files=None,
            content_files=["content/blog/2p2.mdx", "public/assets/images/blog/2p2.jpg"],
        )

    def test_cli_rejects_an_empty_main_file_selection(self) -> None:
        args = abdocstool.build_parser().parse_args(
            ["commit", "-m", "不要全量提交", "--main-files", ","]
        )

        with patch.object(abdocstool, "do_commit") as commit:
            result = abdocstool.run_cli(args)

        self.assertEqual(result, 1)
        commit.assert_not_called()

    def test_do_commit_rejects_an_empty_main_file_selection(self) -> None:
        initial_head = run_git(self.main, "rev-parse", "HEAD")
        (self.main / "README.md").write_text("未提交的用户改动\n")

        with patch.object(abdocstool, "get_main_repo", return_value=self.main):
            result = abdocstool.do_commit(
                main_message="不要全量提交", main_files=[]
            )

        self.assertEqual(result, 1)
        self.assertEqual(run_git(self.main, "rev-parse", "HEAD"), initial_head)
        self.assertIn("README.md", run_git(self.main, "status", "--short"))

    def test_content_only_commit_refuses_pre_staged_changes(self) -> None:
        kept = self.subrepo / "content/blog/kept.mdx"
        kept.write_text("已暂存的其他改动\n")
        run_git(self.subrepo, "add", "content/blog/kept.mdx")
        article = self.main / "content/blog/2p2.mdx"
        article.parent.mkdir(parents=True, exist_ok=True)
        article.write_text("AstroBox 2.2\n")
        initial_head = run_git(self.subrepo, "rev-parse", "HEAD")

        with patch.object(abdocstool, "get_main_repo", return_value=self.main):
            result = abdocstool.do_commit(
                content_message="新增 AstroBox 2.2 发布博客",
                content_files=["content/blog/2p2.mdx"],
            )

        self.assertEqual(result, 1)
        self.assertEqual(run_git(self.subrepo, "rev-parse", "HEAD"), initial_head)
        self.assertIn("content/blog/kept.mdx", run_git(self.subrepo, "diff", "--cached", "--name-only"))

    def test_selected_git_path_is_treated_literally(self) -> None:
        other = self.subrepo / "content/blog/post-other.mdx"
        other.write_text("基线\n")
        run_git(self.subrepo, "add", "content/blog/post-other.mdx")
        run_git(self.subrepo, "commit", "-m", "增加未选博客文件")
        other.write_text("未暂存的其他改动\n")
        selected = self.main / "content/blog/post*.mdx"
        selected.parent.mkdir(parents=True, exist_ok=True)
        selected.write_text("精确选中的文件\n")

        with patch.object(abdocstool, "get_main_repo", return_value=self.main):
            result = abdocstool.do_commit(
                content_message="只提交星号文件",
                content_files=["content/blog/post*.mdx"],
            )

        self.assertEqual(result, 0)
        committed = run_git(
            self.subrepo, "show", "--format=", "--name-only", "HEAD"
        ).splitlines()
        self.assertEqual(committed, ["content/blog/post*.mdx"])
        self.assertEqual(
            run_git(self.subrepo, "diff", "--name-only"),
            "content/blog/post-other.mdx",
        )
        self.assertEqual(run_git(self.subrepo, "diff", "--cached", "--name-only"), "")


if __name__ == "__main__":
    unittest.main()
