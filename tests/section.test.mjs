import assert from "node:assert/strict";
import { test } from "node:test";
import { getSection } from "../src/lib/section.ts";

test("maps versioned plugin route segments to their section", () => {
  assert.equal(getSection(["plugin-development", "v1"]), "legacy");
  assert.equal(getSection(["plugin-development", "v2"]), "plugin");
  assert.equal(getSection(["plugin-development", "v4"]), "plugin");
});
