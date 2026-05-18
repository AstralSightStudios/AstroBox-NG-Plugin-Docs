import { docs } from "fumadocs-mdx:collections/server";
import { createElement } from "react";
import { loader } from "fumadocs-core/source";
import {
  ArchiveIcon,
  BookOpenIcon,
  BracketsCurlyIcon,
  ConfettiIcon,
  CpuIcon,
  DownloadIcon,
  FileCodeIcon,
  FileTextIcon,
  HardDriveIcon,
  IdentificationCardIcon,
  LinkSimpleHorizontalIcon,
  MagicWandIcon,
  PlugIcon,
  RocketIcon,
} from "@phosphor-icons/react/dist/ssr";

const docIcons = {
  Archive: ArchiveIcon,
  BookOpen: BookOpenIcon,
  Braces: BracketsCurlyIcon,
  Confetti: ConfettiIcon,
  Cpu: CpuIcon,
  Download: DownloadIcon,
  FileCode: FileCodeIcon,
  FileText: FileTextIcon,
  HardDrive: HardDriveIcon,
  HardDriveDownload: HardDriveIcon,
  IdentificationCard: IdentificationCardIcon,
  IdCard: IdentificationCardIcon,
  Link2: LinkSimpleHorizontalIcon,
  LinkSimpleHorizontal: LinkSimpleHorizontalIcon,
  MagicWand: MagicWandIcon,
  PartyPopper: ConfettiIcon,
  Plug: PlugIcon,
  Plug2: PlugIcon,
  Rocket: RocketIcon,
  SquareCode: FileCodeIcon,
  WandSparkles: MagicWandIcon,
} as const;

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  i18n: {
    defaultLanguage: "zh-CN",
    languages: ["zh-CN"],
    hideLocale: "always",
  },
  icon(icon) {
    if (!icon) return;

    const Icon = docIcons[icon as keyof typeof docIcons];
    if (!Icon) return;

    return createElement(Icon, {
      className: "ab-doc-icon",
      size: 16,
    });
  },
});
