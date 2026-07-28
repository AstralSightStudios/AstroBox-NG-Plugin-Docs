#!/usr/bin/env tsx
/**
 * Fetch docs content and assets from the sub-repository.
 * Runs before build to ensure the latest content is synced.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const REPO_URL =
  "https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Docs-Content.git";
const CACHE_DIR = path.join(projectRoot, ".docs-content-cache");

const SOURCE_CONTENT = path.join(CACHE_DIR, "content", "docs");
const SOURCE_ASSETS = path.join(
  CACHE_DIR,
  "public",
  "assets",
  "images",
  "docs",
);
const TARGET_CONTENT = path.join(projectRoot, "content", "docs");
const TARGET_ASSETS = path.join(
  projectRoot,
  "public",
  "assets",
  "images",
  "docs",
);

function run(cmd: string, cwd?: string) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function rmrf(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function syncDir(src: string, dest: string) {
  rmrf(dest);
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true });
}

function main() {
  console.log("📦 Fetching docs content from sub-repo...");

  // Clone or update the shallow cache
  if (fs.existsSync(path.join(CACHE_DIR, ".git"))) {
    console.log("  ↳ Updating existing cache...");
    run("git fetch --depth 1 origin main", CACHE_DIR);
    run("git reset --hard origin/main", CACHE_DIR);
  } else {
    console.log("  ↳ Cloning fresh...");
    rmrf(CACHE_DIR);
    run(`git clone --depth 1 ${REPO_URL} "${CACHE_DIR}"`);
  }

  // Sync to project directories
  console.log("🔄 Syncing content/docs...");
  syncDir(SOURCE_CONTENT, TARGET_CONTENT);

  console.log("🔄 Syncing public/assets/images/docs...");
  syncDir(SOURCE_ASSETS, TARGET_ASSETS);

  console.log("✅ Docs content synced.");
}

main();
