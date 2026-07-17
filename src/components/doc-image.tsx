"use client";

import { useState, useRef, useEffect } from "react";
import Zoom from "react-medium-image-zoom";

function getSrc(src: any): string {
  if (typeof src === "string") return src;
  if (typeof src === "object" && src !== null) {
    return (src as { src?: string }).src ?? "";
  }
  return "";
}

export function DocImage(props: any) {
  const { width: _width, height: _height, ...rest } = props;
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imgSrc = getSrc(rest.src);

  const handleLoad = () => {
    const img = imgRef.current;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setIsLandscape(img.naturalWidth >= img.naturalHeight);
    }
  };

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      handleLoad();
    }
  }, []);

  // Portrait (or loading): keep narrow width.
  // Landscape: relax width so the image is readable.
  const imgClass =
    isLandscape === true
      ? "mx-auto block w-[95%] max-w-3xl rounded-xl"
      : "mx-auto block w-4/5 max-w-md rounded-xl sm:w-2/5";

  return (
    <Zoom zoomMargin={20} wrapElement="span" zoomImg={{ src: imgSrc }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={rest.alt ?? ""}
        className={imgClass}
        onLoad={handleLoad}
      />
    </Zoom>
  );
}
