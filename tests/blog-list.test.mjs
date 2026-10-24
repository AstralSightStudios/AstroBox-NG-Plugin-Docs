import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const blogListSource = readFileSync(
  new URL("../src/components/blog-list.tsx", import.meta.url),
  "utf8",
);
const blogCardSource = blogListSource.slice(blogListSource.indexOf("function BlogCard"));

test("text-only blog cards use title and summary as the card", () => {
  assert.match(blogCardSource, /post\.cover[\s\S]*?rounded-2xl border/);
  assert.match(blogCardSource, /<h2[\s\S]*?post\.title[\s\S]*?<\/h2>[\s\S]*?post\.description/);
  assert.doesNotMatch(blogCardSource, /post\.title\.charAt/);
});
