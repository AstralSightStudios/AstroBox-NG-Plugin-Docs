"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  closedTransform,
  measureFlip,
  openTransform,
  type FlipGeometry,
} from "@/lib/video-zoom";

/**
 * Looping, muted animation clip for MDX, with click-to-zoom.
 *
 * Large screen recordings are an order of magnitude smaller as H.264 video than
 * as animated WebP (the WebP animation format has no inter-frame prediction),
 * so demos use this component instead of an <img>.
 *
 * The zoom is a frame-for-frame port of `react-medium-image-zoom` (rmiz), the
 * library behind every image zoom on the site, so a video zooms exactly like a
 * picture does — see `@/lib/video-zoom` for the geometry. Both the clip and the
 * backdrop transition over 300ms with the CSS default `ease` curve, and
 * `prefers-reduced-motion` collapses that to 0.01ms, matching rmiz's stylesheet.
 *
 * Never shown: player chrome, a close button, or a backdrop `::backdrop` fill.
 * Clicking anywhere, or pressing Escape, dismisses the zoom.
 */

/** rmiz uses `transition: transform 0.3s` / `background-color 0.3s`. */
const DURATION_MS = 300;

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
  const zoomRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const knownLandscape =
    typeof width === "number" && typeof height === "number"
      ? width >= height
      : null;
  const [isLandscape, setIsLandscape] = useState<boolean | null>(knownLandscape);
  const [flip, setFlip] = useState<FlipGeometry | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  /** Playhead of the inline clip when it was opened, so the zoomed copy joins mid-loop. */
  const [resumeAt, setResumeAt] = useState(0);

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
    closeTimer.current = setTimeout(() => setIsMounted(false), DURATION_MS + 50);
    triggerRef.current?.focus();
  };

  const open = () => {
    const inline = videoRef.current;
    const next = inline ? measureFlip(inline) : null;
    if (!next || !inline) return;

    if (closeTimer.current) clearTimeout(closeTimer.current);
    setResumeAt(inline.currentTime);
    setFlip(next);
    setIsMounted(true);
    setIsOpen(true);
  };

  // flip to the centred transform on the frame after mount so it animates
  useEffect(() => {
    if (!isOpen) return;
    // Reading the rect forces the closed transform to be adopted first; without
    // it the browser can collapse both styles into one recalc and skip the
    // transition entirely, leaving the clip to pop open instead of zoom.
    void zoomRef.current?.getBoundingClientRect();
    const raf = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    // same scroll lock as rmiz: pinning the width keeps the page from shifting
    // when the scrollbar disappears, which would invalidate the captured rect
    const previousOverflow = document.body.style.overflow;
    const previousWidth = document.body.style.width;
    const { clientWidth } = document.body;
    document.body.style.overflow = "hidden";
    if (clientWidth > 0) document.body.style.width = `${clientWidth}px`;
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.width = previousWidth;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const videoClass =
    isLandscape === true
      ? "mx-auto block w-[95%] max-w-3xl rounded-xl"
      : "mx-auto block w-4/5 max-w-md rounded-xl sm:w-2/5";

  // identical declaration to rmiz's stylesheet entry for `[data-rmiz-modal-img]`
  // and `[data-rmiz-modal-overlay]`, including the `ease` timing function
  const transition = `transition duration-[300ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:duration-[0.01ms]`;

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
            // rmiz hides the inline element while the zoomed copy is painted, so
            // the two never show through each other on the first frame
            style={{ visibility: isMounted ? "hidden" : undefined }}
            className={videoClass}
          />
        </span>
      </span>

      {isMounted &&
        flip &&
        createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={alt || "动画预览"}
            tabIndex={-1}
            onClick={close}
            // never swallow clicks while transparent (first frame / closing)
            className={`fixed inset-0 z-50 overflow-hidden outline-none ${
              isShown ? "" : "pointer-events-none"
            }`}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 ${transition}`}
              style={{
                backgroundColor: isShown
                  ? "var(--color-fd-background)"
                  : "transparent",
              }}
            />
            <video
              ref={zoomRef}
              src={src}
              aria-label={alt || undefined}
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onLoadedMetadata={(event) => {
                // join the loop where the inline clip was, so the zoom does not
                // restart the recording mid-animation
                if (resumeAt > 0) event.currentTarget.currentTime = resumeAt;
              }}
              style={{
                position: "absolute",
                left: flip.left,
                top: flip.top,
                width: flip.width,
                height: flip.height,
                transformOrigin: "0 0",
                transform: isShown
                  ? openTransform(flip)
                  : closedTransform(flip),
              }}
              // rmiz sets `cursor: zoom-out` on the zoomed image; match it
              className={`cursor-zoom-out rounded-xl ${transition}`}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
