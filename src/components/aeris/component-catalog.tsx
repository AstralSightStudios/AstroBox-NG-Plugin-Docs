"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

type ComponentEntry = [
  slug: string,
  title: string,
  description: string,
  cover?: string,
];

const galleryPath = "/docs/canopus-dev/ui-gallery";
const coverPath = "/assets/canopus/ui-gallery/covers";
const galleryCovers = new Set([
  "page",
  "scroll",
  "pager",
  "header",
  "capsule-button",
  "icon-button",
  "card",
  "status-card",
  "switch",
  "radio",
  "checkbox",
  "choice-list",
  "stepper",
  "dialog",
  "progress-ring",
  "progress-bar",
  "rolling-time",
  "countdown-card",
  "option-grid",
  "numeric-wheel",
  "stepped-slider",
  "confirm-slider",
]);
const tallCovers = new Set(["scroll", "choice-list", "dialog", "progress-ring", "numeric-wheel"]);

export function AerisComponentCatalog({ entries }: { entries: ComponentEntry[] }) {
  const [query, setQuery] = useState("");
  const filter = query.trim().toLowerCase();
  const visible = entries.filter(([slug, title, description]) =>
    `${slug} ${title} ${description}`.toLowerCase().includes(filter),
  );

  return (
    <section className="not-prose" data-aeris-catalog="">
      <label className="relative mb-8 block sm:ml-auto sm:max-w-xs">
        <span className="sr-only">筛选组件</span>
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fd-muted-foreground"
        />
        <input
          type="search"
          placeholder="筛选组件"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-fd-border bg-fd-background py-2 pr-3 pl-9 text-sm text-fd-foreground placeholder:text-fd-muted-foreground"
        />
      </label>
      {visible.length === 0 ? (
        <p role="status" className="text-sm text-fd-muted-foreground">
          没有匹配的组件。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map(([slug, title, description, cover]) => {
            const hasGalleryCover = !cover && galleryCovers.has(slug);
            const coverWidth = hasGalleryCover ? (tallCovers.has(slug) ? "w-7/12" : "w-7/10") : "w-full";

            return (
              <li key={slug}>
                <Link
                  href={`${galleryPath}/${slug}`}
                  className="group block h-full overflow-hidden rounded-2xl bg-black text-white motion-safe:transition-colors motion-safe:duration-200 border-solid border-3 border-black hover:border-fd-primary"
                >
                  <span className="relative block aspect-[3/2] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover ?? `${coverPath}/${hasGalleryCover ? slug : "default"}.svg`}
                      alt=""
                      width={hasGalleryCover ? 336 : 480}
                      height={hasGalleryCover ? 480 : 320}
                      loading="lazy"
                      className={`absolute inset-0 mx-auto h-full ${coverWidth} object-cover grayscale motion-safe:transition-[filter] motion-safe:duration-200 group-hover:grayscale-0`}
                    />
                  </span>
                  <div className="p-4">
                    <h2 className="text-sm mb-0 font-semibold text-white motion-safe:transition-colors motion-safe:duration-200 group-hover:text-fd-primary">
                      {title}
                    </h2>
                    <p className="mt-1 mb-0 text-sm leading-relaxed text-white/70">{description}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
