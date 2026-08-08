import { useRef } from "react";
import { useGSAP } from "@gsap/react";

const clamp01 = (value) => Math.min(1, Math.max(0, value));

export function MascotScrollScene({ children }) {
  const sceneRef = useRef(null);

  useGSAP(
    () => {
      const scene = sceneRef.current;
      const hero = scene?.querySelector(".hero");
      const secondSection = scene?.querySelector(".what-i-build");
      if (!scene || !hero || !secondSection) return undefined;

      const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      let pendingFrame = 0;

      const writeStaticState = () => {
        scene.style.setProperty("--hero-scroll-progress", "0");
        scene.style.setProperty("--hero-scroll-scale", "1");
        scene.style.setProperty("--mascot-scroll-progress", "1");
        scene.style.setProperty("--mascot-scroll-scale", "1");
        scene.style.setProperty("--mascot-scroll-y", "0px");
        scene.style.setProperty("--mascot-scroll-opacity", "1");
        scene.style.setProperty("--build-kicker-opacity", "1");
        scene.style.setProperty("--build-kicker-y", "0px");
      };

      const updateProgress = () => {
        pendingFrame = 0;

        if (reducedMotionQuery.matches) {
          writeStaticState();
          return;
        }

        const viewportHeight = Math.max(window.innerHeight, 1);
        const heroRect = hero.getBoundingClientRect();
        const secondSectionRect = secondSection.getBoundingClientRect();
        const heroProgress = clamp01(-heroRect.top / viewportHeight);
        const mascotProgress = clamp01(
          (viewportHeight - secondSectionRect.top) / viewportHeight,
        );
        const mascotReveal = clamp01((mascotProgress - 0.08) / 0.42);
        const kickerReveal = clamp01((mascotProgress - 0.66) / 0.18);
        const mascotScale =
          0.92 +
          mascotProgress * 0.08 +
          Math.sin(mascotProgress * Math.PI) * 0.22;

        scene.style.setProperty(
          "--hero-scroll-progress",
          heroProgress.toFixed(4),
        );
        scene.style.setProperty(
          "--hero-scroll-scale",
          (1 - heroProgress * 0.08).toFixed(4),
        );
        scene.style.setProperty(
          "--mascot-scroll-progress",
          mascotProgress.toFixed(4),
        );
        scene.style.setProperty(
          "--mascot-scroll-scale",
          mascotScale.toFixed(4),
        );
        scene.style.setProperty(
          "--mascot-scroll-y",
          `${((1 - mascotReveal) * 44).toFixed(2)}%`,
        );
        scene.style.setProperty(
          "--mascot-scroll-opacity",
          mascotReveal.toFixed(4),
        );
        scene.style.setProperty(
          "--build-kicker-opacity",
          kickerReveal.toFixed(4),
        );
        scene.style.setProperty(
          "--build-kicker-y",
          `${((1 - kickerReveal) * 12).toFixed(2)}px`,
        );
      };

      const requestUpdate = () => {
        if (pendingFrame) return;
        pendingFrame = window.requestAnimationFrame(updateProgress);
      };

      const resizeObserver = new ResizeObserver(requestUpdate);
      resizeObserver.observe(hero);
      resizeObserver.observe(secondSection);
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate, { passive: true });
      reducedMotionQuery.addEventListener("change", requestUpdate);
      updateProgress();

      return () => {
        if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
        resizeObserver.disconnect();
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
        reducedMotionQuery.removeEventListener("change", requestUpdate);
      };
    },
    { scope: sceneRef },
  );

  return (
    <div className="mascot-scroll-scene" ref={sceneRef}>
      {children}
    </div>
  );
}
