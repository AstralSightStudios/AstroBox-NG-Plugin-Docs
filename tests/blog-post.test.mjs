import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const articlePageSource = readFileSync(
  new URL("../src/app/blog/[slug]/page.tsx", import.meta.url),
  "utf8",
);

test("blog article page does not show the getting-started CTA", () => {
  assert.doesNotMatch(articlePageSource, /开始使用 AstroBox/);
});

test("blog article shows the cover first on mobile and text first on desktop", () => {
  assert.match(
    articlePageSource,
    /<div className="order-2 min-w-0 lg:order-1">/,
  );
  assert.match(
    articlePageSource,
    /<div className="relative order-1 aspect-\[64\/27\][^"]*lg:order-2[^"]*">/,
  );
});
