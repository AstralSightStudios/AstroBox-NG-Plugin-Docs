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

test("getFeaturedBlogItems preserves curated order without filling missing posts", () => {
  assert.equal(typeof blogUtils.getFeaturedBlogItems, "function");

  const posts = [
    { url: "/blog/newer", title: "newer", date: "2026-10-20", tags: [] },
    { url: "/blog/2p0", title: "2.0", date: "2026-06-28", tags: [] },
    { url: "/blog/2p2", title: "2.2", date: "2026-10-03", tags: [] },
    { url: "/blog/2p1", title: "2.1", date: "2026-08-18", tags: [] },
  ];

  const featured = blogUtils.getFeaturedBlogItems(posts, [
    "/blog/2p2",
    "/blog/2p1",
    "/blog/2p0",
    "/blog/not-published",
  ]);

  assert.deepEqual(
    featured.map((post) => post.url),
    ["/blog/2p2", "/blog/2p1", "/blog/2p0"],
  );
});
