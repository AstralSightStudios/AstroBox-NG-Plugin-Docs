/**
 * 根据文档路径返回对应的 Section 名称
 * - usage: 使用文档（默认主题色）
 * - plugin: 插件开发文档（plugin-dev, plugin-v1）
 * - creator: 创作者工具文档（creator-tools）
 */
export function getSection(path: string | undefined): string | undefined {
  if (!path) return undefined;
  const [dir] = path.split("/", 1);
  if (!dir) return undefined;

  switch (dir) {
    case "plugin-dev":
      return "plugin";
    case "plugin-v1":
      return "legacy";
    case "creator-tools":
      return "creator";
    case "usage":
      return "usage";
    default:
      return undefined;
  }
}
