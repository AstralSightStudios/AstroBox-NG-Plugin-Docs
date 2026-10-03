import { createFromSource } from "fumadocs-core/search/server";
import { loader, multiple, update } from "fumadocs-core/source";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import { blog, docs } from "fumadocs-mdx:collections/server";

const searchSource = loader(
  update(
    multiple({
      docs: docs.toFumadocsSource(),
      blog: blog.toFumadocsSource(),
    }),
  )
    .page((page) => ({
      ...page,
      path: `${page.data.type}/${page.path}`,
    }))
    .build(),
  {
    baseUrl: "/",
    i18n: {
      defaultLanguage: "zh-CN",
      languages: ["zh-CN"],
      hideLocale: "always",
    },
  },
);

export const { GET } = createFromSource(searchSource, {
  localeMap: {
    "zh-CN": {
      components: {
        tokenizer: createTokenizer(),
      },
      search: {
        threshold: 0,
        tolerance: 0,
      },
    },
  },
});
