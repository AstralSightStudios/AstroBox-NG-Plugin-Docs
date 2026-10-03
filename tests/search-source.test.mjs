import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const searchRoute = readFileSync(
  new URL("../src/app/api/search/route.ts", import.meta.url),
  "utf8",
);

test("search API indexes both docs and blog with their own route prefixes", () => {
  assert.match(
    searchRoute,
    /import\s+\{\s*blog\s*,\s*docs\s*\}\s+from\s+"fumadocs-mdx:collections\/server"/,
  );
  assert.match(
    searchRoute,
    /multiple\(\s*\{[\s\S]*?docs:\s*docs\.toFumadocsSource\(\),[\s\S]*?blog:\s*blog\.toFumadocsSource\(\)[\s\S]*?\}\s*\)/,
  );
  assert.match(
    searchRoute,
    /path:\s*`\$\{page\.data\.type\}\/\$\{page\.path\}`/,
  );
  assert.match(searchRoute, /createFromSource\(searchSource/);
});
