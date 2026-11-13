"use client";

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
  MusicNotesIcon,
  PlugIcon,
  PuzzlePieceIcon,
  RocketIcon,
  UsersIcon,
  WatchIcon,
  WrenchIcon,
} from "@phosphor-icons/react";

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
  MusicNotes: MusicNotesIcon,
  PartyPopper: ConfettiIcon,
  Plug: PlugIcon,
  Plug2: PlugIcon,
  PuzzlePiece: PuzzlePieceIcon,
  Rocket: RocketIcon,
  SquareCode: FileCodeIcon,
  Users: UsersIcon,
  WandSparkles: MagicWandIcon,
  Watch: WatchIcon,
  Wrench: WrenchIcon,
} as const;

export function DocIcon({ name }: { name: string }) {
  if (!Object.hasOwn(docIcons, name)) return null;

  const Icon = docIcons[name as keyof typeof docIcons];
  return <Icon className="ab-doc-icon" size={16} />;
}
