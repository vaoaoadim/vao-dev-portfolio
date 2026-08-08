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

const CURSOR_STATES = {
  default: {
    fill: "/assets/ui/cursor/arrow-fill.png",
    silhouette: "/assets/ui/cursor/arrow-silhouette.png",
    lines: [
      "/assets/ui/cursor/default-red.png",
      "/assets/ui/cursor/default-blue.png",
      "/assets/ui/cursor/default-yellow.png",
      "/assets/ui/cursor/default-green.png",
    ],
  },
  hover: {
    fill: "/assets/ui/cursor/hand-fill.png",
    silhouette: "/assets/ui/cursor/hand-silhouette.png",
    lines: [
      "/assets/ui/cursor/hover-red.png",
      "/assets/ui/cursor/hover-blue.png",
      "/assets/ui/cursor/hover-yellow.png",
      "/assets/ui/cursor/hover-green.png",
    ],
  },
};

const LINE_MOTION_PRESETS = [
  [
    { x: -4, y: 3, rotation: 90, scale: 1.08, opacity: 0.78 },
    { x: 5, y: -3, rotation: -90, scale: 0.91, opacity: 0.7 },
    { x: -2, y: 5, rotation: 180, scale: 1.12, opacity: 0.82 },
    { x: 4, y: -6, rotation: 90, scale: 1.06, opacity: 0.84 },
  ],
  [
    { x: 3, y: -5, rotation: -90, scale: 0.9, opacity: 0.72 },
    { x: -6, y: 2, rotation: 180, scale: 1.1, opacity: 0.8 },
    { x: 5, y: 4, rotation: 90, scale: 0.86, opacity: 0.66 },
    { x: -3, y: -5, rotation: -90, scale: 1.14, opacity: 0.86 },
  ],
  [
    { x: 6, y: 2, rotation: 180, scale: 1.14, opacity: 0.83 },
    { x: -2, y: 6, rotation: 90, scale: 0.87, opacity: 0.69 },
    { x: -5, y: -3, rotation: -90, scale: 1.06, opacity: 0.76 },
    { x: 3, y: 5, rotation: 180, scale: 1.06, opacity: 0.84 },
  ],
  [
    { x: -4, y: -5, rotation: 90, scale: 0.88, opacity: 0.67 },
    { x: 5, y: 4, rotation: -90, scale: 1.13, opacity: 0.82 },
    { x: 2, y: -6, rotation: 180, scale: 0.93, opacity: 0.73 },
    { x: -6, y: 3, rotation: 90, scale: 1.08, opacity: 0.84 },
  ],
];

function CursorState({ name, stateRef, lineRefs }) {
  const { fill, silhouette, lines } = CURSOR_STATES[name];

  return (
    <div ref={stateRef} className={`pixel-cursor__state pixel-cursor__state--${name}`}>
      <img className="pixel-cursor__fill" src={fill} alt="" draggable="false" />
      <img className="pixel-cursor__silhouette" src={silhouette} alt="" draggable="false" />
      {lines.map((source, index) => (
        <img
          key={source}
          ref={(element) => {
            lineRefs.current[name][index] = element;
          }}
          className="pixel-cursor__line"
          src={source}
          alt=""
          draggable="false"
        />
      ))}
    </div>
  );
}

export function PixelCursor() {
  const cursorRef = useRef(null);
  const stateRefs = useRef({ default: null, hover: null });
  const lineRefs = useRef({ default: [], hover: [] });
  const isInteractiveRef = useRef(false);
  const activeTransitionRef = useRef(null);
  const presetIndexRef = useRef(0);

  useGSAP(
    (context, contextSafe) => {
      const cursor = cursorRef.current;
      if (!cursor || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) {
        return undefined;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const getLines = (name) => lineRefs.current[name].filter(Boolean);
      const resetLines = (name) => {
        gsap.set(getLines(name), { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
      };
      const setVisibleState = (name) => {
        gsap.set(stateRefs.current.default, { autoAlpha: name === "default" ? 1 : 0 });
        gsap.set(stateRefs.current.hover, { autoAlpha: name === "hover" ? 1 : 0 });
      };

      const changeState = contextSafe((isInteractive) => {
        if (isInteractive === isInteractiveRef.current) return;

        const previousState = isInteractiveRef.current ? "hover" : "default";
        const nextState = isInteractive ? "hover" : "default";
        activeTransitionRef.current?.kill();
        resetLines("default");
        resetLines("hover");
        setVisibleState(previousState);
        isInteractiveRef.current = isInteractive;

        if (reducedMotion) {
          setVisibleState(nextState);
          return;
        }

        const previousLines = getLines(previousState);
        const nextLines = getLines(nextState);
        const motionPreset = LINE_MOTION_PRESETS[presetIndexRef.current];
        presetIndexRef.current = (presetIndexRef.current + 1) % LINE_MOTION_PRESETS.length;
        const timeline = gsap.timeline({
          onComplete: () => {
            activeTransitionRef.current = null;
          },
        });

        previousLines.forEach((line, index) => {
          const motion = motionPreset[index];
          timeline.to(
            line,
            {
              x: motion.x * 0.35,
              y: motion.y * 0.35,
              rotation: motion.rotation,
              scale: 1,
              opacity: 0.94,
              duration: 0.07,
              ease: "steps(2)",
            },
            0,
          );
          timeline.to(line, { ...motion, duration: 0.16, ease: "steps(3)" }, 0.07);
        });

        nextLines.forEach((line, index) => {
          const motion = motionPreset[index];
          timeline.set(line, motion, 0.15);
          timeline.to(
            line,
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              duration: 0.15,
              ease: "steps(3)",
            },
            0.23,
          );
        });

        timeline.set(stateRefs.current[nextState], { autoAlpha: 1 }, 0.15);
        timeline.set(stateRefs.current[previousState], { autoAlpha: 0 }, 0.15);
        activeTransitionRef.current = timeline;
      });

      const moveCursor = contextSafe((event) => {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursor.dataset.visible = "true";
        document.documentElement.classList.add("has-pixel-cursor");

        const target = event.target instanceof Element ? event.target : null;
        const interactiveTarget = target?.closest(INTERACTIVE_SELECTOR);
        const cursorMode = interactiveTarget?.getAttribute("data-cursor");
        changeState(Boolean(interactiveTarget) && cursorMode !== "default");
      });

      const hideCursor = () => {
        cursor.dataset.visible = "false";
      };

      setVisibleState("default");
      window.addEventListener("pointermove", moveCursor, { passive: true });
      window.addEventListener("blur", hideCursor);

      return () => {
        activeTransitionRef.current?.kill();
        window.removeEventListener("pointermove", moveCursor);
        window.removeEventListener("blur", hideCursor);
        document.documentElement.classList.remove("has-pixel-cursor");
      };
    },
    { scope: cursorRef },
  );

  return (
    <div ref={cursorRef} className="pixel-cursor" aria-hidden="true" data-visible="false">
      <div className="pixel-cursor__inner">
        <CursorState
          name="default"
          stateRef={(element) => {
            stateRefs.current.default = element;
          }}
          lineRefs={lineRefs}
        />
        <CursorState
          name="hover"
          stateRef={(element) => {
            stateRefs.current.hover = element;
          }}
          lineRefs={lineRefs}
        />
      </div>
    </div>
  );
}
