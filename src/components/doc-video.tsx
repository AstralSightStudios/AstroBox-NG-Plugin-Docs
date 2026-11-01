"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Looping, muted animation clip for MDX, with click-to-zoom.
 *
 * Large screen recordings are an order of magnitude smaller as H.264 video than
 * as animated WebP (the WebP animation format has no inter-frame prediction),
 * so demos use this component instead of an <img>.
 *
 * Behaviour matches the image zoom used elsewhere on the site (which is built on
 * react-medium-image-zoom): no player chrome is ever shown, the clip autoplays
 * and loops, and the zoomed view uses the page background with no visible
 * close button — clicking anywhere or pressing Escape dismisses it.
 */
export function DocVideo({
  src,
  alt = "",
  width,
  height,
  ...rest
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const knownLandscape =
    typeof width === "number" && typeof height === "number"
      ? width >= height
      : null;
  const [isLandscape, setIsLandscape] = useState<boolean | null>(knownLandscape);
  const [isOpen, setIsOpen] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // keep the inline clip playing while the zoom overlay is closed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const measure = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setIsLandscape(video.videoWidth >= video.videoHeight);
      }
    };

    const ensurePlaying = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      const played = video.play();
      if (played && typeof played.catch === "function") {
        played.catch(() => {
          /* autoplay blocked (e.g. reduced motion); first frame stays visible */
        });
      }
    };

    if (video.readyState >= 1) measure();
    ensurePlaying();
    video.addEventListener("loadeddata", ensurePlaying);
    return () => video.removeEventListener("loadeddata", ensurePlaying);
  }, []);

  const close = () => {
    setIsOpen(false);
    setIsShown(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsMounted(false), 200);
    triggerRef.current?.focus();
  };

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsMounted(true);
    setIsOpen(true);
  };

  // fade/scale in on the frame after mount so the transition runs
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const videoClass =
    isLandscape === true
      ? "mx-auto block w-[95%] max-w-3xl rounded-xl"
      : "mx-auto block w-4/5 max-w-md rounded-xl sm:w-2/5";

  const zoomTransition = "transition duration-200 ease-out";
  const motion = "motion-reduce:transform-none motion-reduce:transition-none";

  return (
    <>
      <span className="block text-center">
        <span
          ref={triggerRef}
          role="button"
          tabIndex={0}
          aria-label={alt ? `放大：${alt}` : "放大动画"}
          onClick={open}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              open();
            }
          }}
          className="block cursor-zoom-in rounded-xl outline-offset-4"
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            {...rest}
            ref={videoRef}
            src={src}
            width={width}
            height={height}
            aria-label={alt || undefined}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            preload="auto"
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              if (video.videoWidth > 0) {
                setIsLandscape(video.videoWidth >= video.videoHeight);
              }
            }}
            className={videoClass}
          />
        </span>
      </span>

      {isMounted &&
        createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={alt || "动画预览"}
            tabIndex={-1}
            onClick={close}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 outline-none ${zoomTransition} ${motion} ${
              isShown ? "bg-fd-background opacity-100" : "bg-fd-background/0 opacity-0"
            }`}
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={src}
              aria-label={alt || undefined}
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              className={`max-h-[90dvh] max-w-[95vw] rounded-xl ${zoomTransition} ${motion} ${
                isShown ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
