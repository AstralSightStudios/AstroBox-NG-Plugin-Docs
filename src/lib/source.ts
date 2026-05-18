import { docs } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  i18n: {
    defaultLanguage: "zh-CN",
    languages: ["zh-CN"],
    hideLocale: "always",
  },
  plugins: [lucideIconsPlugin()],
});
