import assert from "node:assert/strict";
import { test } from "node:test";
import * as blogUtils from "../src/lib/blog-utils.ts";

test("getLatestBlogItems returns at most three posts in newest-first order", () => {
  assert.equal(typeof blogUtils.getLatestBlogItems, "function");

  const posts = [
    { url: "/blog/old", title: "old", date: "2025-01-01", tags: [] },
    { url: "/blog/newest", title: "newest", date: "2026-06-01", tags: [] },
    { url: "/blog/third", title: "third", date: "2026-04-01", tags: [] },
    { url: "/blog/second", title: "second", date: "2026-05-01", tags: [] },
  ];

  const latest = blogUtils.getLatestBlogItems(posts);

  assert.deepEqual(
    latest.map((post) => post.title),
    ["newest", "second", "third"],
  );
  assert.deepEqual(posts.map((post) => post.title), ["old", "newest", "third", "second"]);
});
