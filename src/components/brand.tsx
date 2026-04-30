import Image from "next/image";

type AstroBoxBrandIconProps = {
  className?: string;
};

export function AstroBoxBrandIcon({ className }: AstroBoxBrandIconProps) {
  return (
    <Image
      src="/brand-icon.png"
      alt=""
      aria-hidden="true"
      width={28}
      height={28}
      className={className}
    />
  );
}

export function AstroBoxBrandTitle() {
  return (
    <span className="inline-flex items-center gap-2">
      <AstroBoxBrandIcon className="size-5 shrink-0" />
      <span>AstroBox 文档</span>
    </span>
  );
}
