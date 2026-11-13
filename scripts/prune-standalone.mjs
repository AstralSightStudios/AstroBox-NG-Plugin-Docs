#!/usr/bin/env node
/**
 * EdgeOne 会把 .next/standalone 下的服务端产物打成 SSR 函数包，上限 128 MiB。
 * 预渲染的 HTML/RSC 已经由适配器复制到静态资源目录，再从函数包里带一份会重复占体积。
 * 这里只裁剪 standalone 副本，.next/server/app 保持完整供静态资源使用。
 * .segments 保留在函数包中，客户端分段预取仍由原产物处理。
 */
import fs from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), ".next/standalone/.next/server/app");

if (!fs.existsSync(appDir)) {
  process.exit(0);
}

let removedFiles = 0;
let removedBytes = 0;

function removeFile(file) {
  try {
    removedBytes += fs.statSync(file).size;
    fs.rmSync(file, { force: true });
    removedFiles += 1;
  } catch {
    // 构建产物可能被并发访问，忽略单个文件失败。
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    const name = entry.name;
    const isSegment = name.endsWith(".segment.rsc");
    if (name.endsWith(".html") || name.endsWith(".meta") || (name.endsWith(".rsc") && !isSegment)) {
      removeFile(full);
    }
  }
}

walk(appDir);

const megabytes = (removedBytes / 1024 / 1024).toFixed(1);
console.log(`[prune-standalone] removed ${removedFiles} prerendered entries (${megabytes} MiB) from the SSR bundle`);
