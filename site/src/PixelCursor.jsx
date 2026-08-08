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

  useGSAP(
    (context, contextSafe) => {
      const cursor = cursorRef.current;
      const root = document.documentElement;

      if (!cursor || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) {
        return undefined;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const setColor = contextSafe((color) => {
        gsap.to(cursor, {
          color,
          duration: reducedMotion ? 0 : 0.14,
          ease: "power1.out",
          overwrite: "auto",
        });
      });

      const updateTargetState = contextSafe((target) => {
        const interactiveTarget = getInteractiveTarget(target);

        if (interactiveTarget === activeTargetRef.current) return;

        activeTargetRef.current = interactiveTarget;

        if (interactiveTarget) {
          cursor.dataset.mode = "hover";
          const color = HOVER_COLORS[colorIndexRef.current];
          colorIndexRef.current = (colorIndexRef.current + 1) % HOVER_COLORS.length;
          setColor(color);
          return;
        }

        gsap.set(cursor, { color: "#ffffff" });
        cursor.dataset.mode = "default";
      });

      const moveCursor = contextSafe((event) => {
        gsap.set(cursor, { x: event.clientX, y: event.clientY });
        cursor.dataset.visible = "true";
        root.classList.add("has-letter-cursor");
        updateTargetState(event.target);
      });

      const hideCursor = contextSafe(() => {
        cursor.dataset.visible = "false";
        cursor.dataset.mode = "default";
        activeTargetRef.current = null;
        root.classList.remove("has-letter-cursor");
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
      window.addEventListener("mouseleave", hideCursor);
      window.addEventListener("blur", hideCursor);
      document.addEventListener("pointerout", hideWhenLeavingDocument);
      document.addEventListener("visibilitychange", hideOnVisibilityChange);

      return () => {
        window.removeEventListener("pointermove", moveCursor);
        window.removeEventListener("mouseleave", hideCursor);
        window.removeEventListener("blur", hideCursor);
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
      data-visible="false"
    >
      <span className="pixel-cursor__glyph">V</span>
    </div>
  );
}
