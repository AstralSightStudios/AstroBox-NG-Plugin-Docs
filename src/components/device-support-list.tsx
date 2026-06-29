"use client";

import { useState } from "react";
import {
  CaretDownIcon,
  CaretUpIcon,
  CheckCircleIcon,
  WatchIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

interface SupportedDevice {
  name: string;
  status: string;
  note: string;
}

interface DeviceSupportListProps {
  devices?: SupportedDevice[];
  productName?: string;
  defaultOpen?: boolean;
  showHeader?: boolean;
}

import rawDownloads from "@/lib/downloads.json";

function getAstroBoxDevices(): SupportedDevice[] {
  const astrobox = rawDownloads.products.find((p) => p.id === "astrobox");
  return (astrobox?.supportedDevices as SupportedDevice[]) ?? [];
}

export function DeviceSupportList({
  devices,
  productName,
  defaultOpen = true,
  showHeader = true,
}: DeviceSupportListProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const supportedDevices = devices ?? getAstroBoxDevices();
  const name = productName ?? "AstroBox";

  if (supportedDevices.length === 0) return null;

  const table = (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="hidden bg-fd-accent/50 md:table-row">
          <th className="px-4 py-2.5 font-medium text-fd-foreground">型号</th>
          <th className="px-4 py-2.5 font-medium text-fd-foreground">状态</th>
          <th className="px-4 py-2.5 font-medium text-fd-foreground">备注</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-fd-border/60">
        {supportedDevices.map((device) => (
          <tr
            key={device.name}
            className="block transition-colors hover:bg-fd-accent/30 md:table-row"
          >
            <td className="block px-4 pt-4 pb-1 text-fd-foreground md:table-cell md:py-2.5">
              <div className="flex items-start justify-between gap-3 md:block">
                <span>{device.name}</span>
                <span className="shrink-0 md:hidden">
                  {device.status === "supported" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-green-600 dark:text-green-400">
                      <CheckCircleIcon className="size-3" />
                      完整支持
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-fd-muted/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-fd-muted-foreground">
                      <XCircleIcon className="size-3" />
                      不支持
                    </span>
                  )}
                </span>
              </div>
            </td>
            <td className="hidden px-4 py-2.5 md:table-cell">
              {device.status === "supported" ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="size-3" />
                  完整支持
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-fd-muted/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-fd-muted-foreground">
                  <XCircleIcon className="size-3" />
                  不支持
                </span>
              )}
            </td>
            <td className="block px-4 pt-1 pb-4 text-sm text-fd-muted-foreground md:table-cell md:py-2.5">
              {device.note}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!showHeader) {
    return table;
  }

  return (
    <div className="rounded-3xl border border-fd-border/60 bg-fd-background p-3 md:p-4.5">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex shrink-0 items-center justify-center rounded-xl bg-fd-primary/10 p-2.5 text-fd-primary">
            <WatchIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-fd-foreground">
              下载前，先确认你的设备是否受支持
            </h3>
            <p className="text-sm text-fd-muted-foreground">
              {name}支持多种主流穿戴设备，但不同型号的功能适配情况可能存在差异。
            </p>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-foreground">
          {isOpen ? (
            <CaretUpIcon className="size-5" />
          ) : (
            <CaretDownIcon className="size-5" />
          )}
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 overflow-hidden rounded-xl border border-fd-border/60">
            {table}
          </div>
        </div>
      </div>
    </div>
  );
}
