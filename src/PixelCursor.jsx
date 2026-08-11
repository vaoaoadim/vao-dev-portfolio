import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const INTERACTIVE_SELECTOR = [
  "[data-cursor]",
  "a",
  "button",
  "[role='button']",
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
].join(",");

const HOVER_COLORS = ["#23ad64", "#efc331", "#ef4c46", "#fb7b2d"];

function parseRgb(color) {
  const channels = color.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) return null;

  const [red, green, blue, alpha = 1] = channels;
  return alpha > 0.05 ? [red, green, blue] : null;
}

function isChromaticSurface(target) {
  let element = target instanceof Element ? target : null;

  while (element) {
    const color = parseRgb(window.getComputedStyle(element).backgroundColor);

    if (color) {
      const highestChannel = Math.max(...color);
      const lowestChannel = Math.min(...color);
      const channelDelta = highestChannel - lowestChannel;

      return channelDelta > 28 && channelDelta / Math.max(highestChannel, 1) > 0.14;
    }

    element = element.parentElement;
  }

  return false;
}

function getInteractiveTarget(target) {
  if (!(target instanceof Element)) return null;

  const interactiveTarget = target.closest(INTERACTIVE_SELECTOR);
  return interactiveTarget?.getAttribute("data-cursor") === "default"
    ? null
    : interactiveTarget;
}

export function PixelCursor() {
  const cursorRef = useRef(null);
  const activeTargetRef = useRef(null);
  const colorIndexRef = useRef(0);
  const lastTargetRef = useRef(null);
  const lastPointerRef = useRef({ x: 0, y: 0, inside: false });

  useGSAP(
    (context, contextSafe) => {
      const cursor = cursorRef.current;
      const root = document.documentElement;

      if (!cursor || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) {
        return undefined;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const setColor = contextSafe((color) => {
        gsap.killTweensOf(cursor, "color");
        gsap.to(cursor, {
          color,
          duration: reducedMotion ? 0 : 0.14,
          ease: "power1.out",
          overwrite: "all",
        });
      });

      const setDefaultAppearance = contextSafe((target) => {
        const useSolidInk = isChromaticSurface(target);

        gsap.killTweensOf(cursor, "color");
        gsap.set(cursor, { color: useSolidInk ? "#191919" : "#ffffff" });
        cursor.dataset.mode = "default";
        cursor.dataset.tone = useSolidInk ? "solid" : "adaptive";
      });

      const updateTargetState = contextSafe((target) => {
        const targetElement = target instanceof Element ? target : null;
        const interactiveTarget = getInteractiveTarget(target);

        if (interactiveTarget && interactiveTarget === activeTargetRef.current) {
          lastTargetRef.current = targetElement;
          return;
        }

        if (
          !interactiveTarget &&
          !activeTargetRef.current &&
          targetElement === lastTargetRef.current
        ) {
          return;
        }

        lastTargetRef.current = targetElement;
        activeTargetRef.current = interactiveTarget;

        if (interactiveTarget) {
          cursor.dataset.mode = "hover";
          cursor.dataset.tone = "solid";
          const color = HOVER_COLORS[colorIndexRef.current];
          colorIndexRef.current = (colorIndexRef.current + 1) % HOVER_COLORS.length;
          setColor(color);
          return;
        }

        setDefaultAppearance(target);
      });

      const moveCursor = contextSafe((event) => {
        lastPointerRef.current = {
          x: event.clientX,
          y: event.clientY,
          inside: true,
        };
        gsap.set(cursor, { x: event.clientX, y: event.clientY });
        cursor.dataset.visible = "true";
        root.classList.add("has-letter-cursor");
        updateTargetState(event.target);
      });

      let refreshFrame = 0;
      const refreshTargetState = contextSafe(() => {
        if (!lastPointerRef.current.inside || refreshFrame) return;

        refreshFrame = window.requestAnimationFrame(() => {
          refreshFrame = 0;
          const { x, y } = lastPointerRef.current;
          updateTargetState(document.elementFromPoint(x, y));
        });
      });

      const hideCursor = contextSafe(() => {
        lastPointerRef.current.inside = false;
        cursor.dataset.visible = "false";
        cursor.dataset.mode = "default";
        cursor.dataset.tone = "adaptive";
        activeTargetRef.current = null;
        lastTargetRef.current = null;
        root.classList.remove("has-letter-cursor");
        gsap.killTweensOf(cursor, "color");
        gsap.set(cursor, { color: "#ffffff" });
      });

      const hideWhenLeavingDocument = contextSafe((event) => {
        if (!event.relatedTarget) hideCursor();
      });

      const hideOnVisibilityChange = contextSafe(() => {
        if (document.visibilityState !== "visible") hideCursor();
      });

      gsap.set(cursor, { color: "#ffffff" });
      window.addEventListener("pointermove", moveCursor, { passive: true });
      window.addEventListener("scroll", refreshTargetState, { passive: true, capture: true });
      window.addEventListener("resize", refreshTargetState, { passive: true });
      window.addEventListener("mouseleave", hideCursor);
      window.addEventListener("blur", hideCursor);
      document.addEventListener("pointerover", refreshTargetState, { passive: true });
      document.addEventListener("pointerout", hideWhenLeavingDocument);
      document.addEventListener("visibilitychange", hideOnVisibilityChange);

      return () => {
        window.cancelAnimationFrame(refreshFrame);
        window.removeEventListener("pointermove", moveCursor);
        window.removeEventListener("scroll", refreshTargetState, true);
        window.removeEventListener("resize", refreshTargetState);
        window.removeEventListener("mouseleave", hideCursor);
        window.removeEventListener("blur", hideCursor);
        document.removeEventListener("pointerover", refreshTargetState);
        document.removeEventListener("pointerout", hideWhenLeavingDocument);
        document.removeEventListener("visibilitychange", hideOnVisibilityChange);
        root.classList.remove("has-letter-cursor");
      };
    },
    { scope: cursorRef },
  );

  return (
    <div
      ref={cursorRef}
      className="pixel-cursor"
      aria-hidden="true"
      data-mode="default"
      data-tone="adaptive"
      data-visible="false"
    >
      <span className="pixel-cursor__glyph">V</span>
    </div>
  );
}
