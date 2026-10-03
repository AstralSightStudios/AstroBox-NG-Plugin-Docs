import assert from "node:assert/strict";
import { test } from "node:test";
import { createSearchAPI } from "fumadocs-core/search/server";
import { createCaseInsensitiveMandarinTokenizer } from "../src/lib/search-tokenizer.ts";

test("Mandarin search matches Latin queries regardless of case", async () => {
  const search = createSearchAPI("simple", {
    indexes: [
      {
        title: "AstroBox 2.2 正式发布",
        content: "我们开发了全新的项目 Corona，并带来了资源包。",
        url: "/blog/astrobox-2-2",
      },
    ],
    components: { tokenizer: createCaseInsensitiveMandarinTokenizer() },
    search: { threshold: 0, tolerance: 0 },
  });

  const upperCaseResults = await search.search("Coro");
  const lowerCaseResults = await search.search("coro");

  assert.deepEqual(upperCaseResults.map((result) => result.url), [
    "/blog/astrobox-2-2",
  ]);
  assert.deepEqual(lowerCaseResults.map((result) => result.url), [
    "/blog/astrobox-2-2",
  ]);
});
