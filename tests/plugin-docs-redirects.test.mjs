import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import nextConfig from "../next.config.mjs";

const expectedRedirects = [
  ["/docs/plugin-development", "/docs/plugin-development/v4"],
  ["/docs/plugin-v4", "/docs/plugin-development/v4"],
  ["/docs/plugin-v4/:path*", "/docs/plugin-development/v4/:path*"],
  ["/docs/plugin-dev", "/docs/plugin-development/v2"],
  ["/docs/plugin-dev/:path*", "/docs/plugin-development/v2/:path*"],
  ["/docs/plugin-v1", "/docs/plugin-development/v1"],
  ["/docs/plugin-v1/:path*", "/docs/plugin-development/v1/:path*"],
];

test("legacy plugin doc URLs redirect permanently to their new version paths", async () => {
  const redirects = (await nextConfig.redirects?.()) ?? [];

  for (const [source, destination] of expectedRedirects) {
    assert.ok(
      redirects.some(
        (redirect) =>
          redirect.source === source &&
          redirect.destination === destination &&
          redirect.permanent === true,
      ),
      `Missing permanent redirect: ${source} -> ${destination}`,
    );
  }
});

const docsMetaUrl = new URL("../content/docs/meta.json", import.meta.url);

test(
  "plugin versions are nested in V4, V2, V1 order under one root folder",
  { skip: !existsSync(docsMetaUrl) },
  () => {
    const rootMeta = JSON.parse(readFileSync(docsMetaUrl, "utf8"));
    const pluginMetaUrl = new URL(
      "../content/docs/plugin-development/meta.json",
      import.meta.url,
    );
    const pluginMeta = JSON.parse(readFileSync(pluginMetaUrl, "utf8"));

    assert.equal(rootMeta.pages.filter((page) => page === "plugin-development").length, 1);
    assert.deepEqual(pluginMeta.pages, ["v4", "v2", "v1"]);
    assert.equal(pluginMeta.root, true);

    for (const version of pluginMeta.pages) {
      const versionMetaUrl = new URL(
        `../content/docs/plugin-development/${version}/meta.json`,
        import.meta.url,
      );
      const versionMeta = JSON.parse(readFileSync(versionMetaUrl, "utf8"));
      assert.equal(versionMeta.root, undefined);
    }
  },
);
