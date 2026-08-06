#!/usr/bin/env tsx
/**
 * Fetch docs content and assets from the sub-repository.
 * Runs before build to ensure the latest content is synced.
 *
 * Skips download if local directories already contain files
 * (avoids slow network during local development).
 * Set FORCE_FETCH_DOCS=1 to force re-download.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const REPO_ZIP_URL =
  "https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Docs-Content/archive/refs/heads/main.zip";
const TMP_ZIP = path.join(projectRoot, ".docs-content.zip");
const TMP_EXTRACT = path.join(projectRoot, ".docs-content-extract");

const TARGET_CONTENT = path.join(projectRoot, "content", "docs");
const TARGET_BLOG = path.join(projectRoot, "content", "blog");
const TARGET_ASSETS = path.join(
  projectRoot,
  "public",
  "assets",
  "images",
  "docs",
);

const FORCE = process.env.FORCE_FETCH_DOCS === "1";

function run(cmd: string, cwd?: string) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function rmrf(target: string) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function hasContent(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  const items = fs.readdirSync(dir).filter((n) => n !== ".DS_Store");
  return items.length > 0;
}

function syncDir(src: string, dest: string) {
  rmrf(dest);
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true });
}

function main() {
  console.log("📦 Checking docs content...");

  const contentExists = hasContent(TARGET_CONTENT);
  const blogExists = hasContent(TARGET_BLOG);
  const assetsExist = hasContent(TARGET_ASSETS);

  if (contentExists && blogExists && assetsExist && !FORCE) {
    console.log(
      "  ↳ Local docs content already present. Skipping fetch.",
    );
    console.log(
      "     Set FORCE_FETCH_DOCS=1 to force re-download.",
    );
    console.log("✅ Docs content ready.");
    return;
  }

  console.log("📦 Fetching docs content from sub-repo...");

  // Cleanup previous temp files
  rmrf(TMP_ZIP);
  rmrf(TMP_EXTRACT);

  // Download zip
  console.log("  ↳ Downloading archive...");
  run(`curl -L --max-time 300 -o "${TMP_ZIP}" "${REPO_ZIP_URL}"`);

  // Unzip
  console.log("  ↳ Extracting archive...");
  ensureDir(TMP_EXTRACT);
  run(`unzip -q "${TMP_ZIP}" -d "${TMP_EXTRACT}"`);

  // GitHub zip extracts into a folder like <repo>-main/
  const extractedDirs = fs
    .readdirSync(TMP_EXTRACT)
    .filter((d) => fs.statSync(path.join(TMP_EXTRACT, d)).isDirectory());

  if (extractedDirs.length !== 1) {
    throw new Error(
      `Expected exactly one extracted directory, found: ${extractedDirs.join(", ")}`,
    );
  }

  const repoRoot = path.join(TMP_EXTRACT, extractedDirs[0]);
  const sourceContent = path.join(repoRoot, "content", "docs");
  const sourceBlog = path.join(repoRoot, "content", "blog");
  const sourceAssets = path.join(
    repoRoot,
    "public",
    "assets",
    "images",
    "docs",
  );

  // Sync to project directories
  console.log("🔄 Syncing content/docs...");
  syncDir(sourceContent, TARGET_CONTENT);

  console.log("🔄 Syncing content/blog...");
  syncDir(sourceBlog, TARGET_BLOG);

  console.log("🔄 Syncing public/assets/images/docs...");
  syncDir(sourceAssets, TARGET_ASSETS);

  // Cleanup
  rmrf(TMP_ZIP);
  rmrf(TMP_EXTRACT);

  console.log("✅ Docs content synced.");
}

main();
