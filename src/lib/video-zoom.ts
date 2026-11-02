/**
 * Geometry for the click-to-zoom applied to MDX video clips.
 *
 * This is a port of `react-medium-image-zoom` (rmiz), the library behind every
 * image zoom on the site, so that a demo clip zooms exactly like a screenshot
 * does. rmiz boxes the zoomed element at the *inline* element's viewport
 * position with the largest size that still clears a 20px margin, then moves it
 * to the viewport centre with a `transform` transition. Because the box's
 * top-left never moves, `translate(0, 0) scale(1 / scale)` renders it precisely
 * on top of the inline element — that is the "closed" endpoint, and
 * `translate(tx, ty) scale(1)` is the "open" one.
 *
 * Aspect ratio is preserved by construction (an inline `<video>` has an
 * `auto` height), which is the same condition under which rmiz's `object-fit`
 * maths collapses to this simpler form.
 */

/** rmiz is mounted as `zoomMargin={20}` for images; match it. */
export const ZOOM_MARGIN = 20;

/** Viewport measurements, injectable so the maths can be tested headlessly. */
export type Viewport = { width: number; height: number };

/** Geometry captured from the inline clip at the moment it is opened. */
export type FlipGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  /** Offset that moves the box's centre onto the viewport's centre. */
  translateX: number;
  translateY: number;
};

/**
 * Computes the zoom geometry for an inline element.
 *
 * Returns `null` for an element that has no layout box yet (e.g. a clip that is
 * still loading), in which case the caller should keep the zoom closed.
 */
export function measureFlip(
  el: { getBoundingClientRect(): DOMRect },
  viewport: Viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  },
): FlipGeometry | null {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const scale = Math.min(
    (viewport.width - ZOOM_MARGIN * 2) / rect.width,
    (viewport.height - ZOOM_MARGIN * 2) / rect.height,
  );
  if (!Number.isFinite(scale) || scale <= 0) return null;

  const width = rect.width * scale;
  const height = rect.height * scale;

  return {
    left: rect.left,
    top: rect.top,
    width,
    height,
    scale,
    translateX: viewport.width / 2 - (rect.left + width / 2),
    translateY: viewport.height / 2 - (rect.top + height / 2),
  };
}

/** The "closed" endpoint: the clip sits exactly on top of its inline self. */
export function closedTransform(flip: FlipGeometry): string {
  return `translate(0px, 0px) scale(${1 / flip.scale})`;
}

/** The "open" endpoint: the clip fills the viewport, centred. */
export function openTransform(flip: FlipGeometry): string {
  return `translate(${flip.translateX}px, ${flip.translateY}px) scale(1)`;
}
