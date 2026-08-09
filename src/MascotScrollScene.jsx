import { useRef } from "react";
import { useGSAP } from "@gsap/react";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const MASCOT_SOURCE_ASPECT = 1117 / 941;
const MASCOT_OPAQUE_TOP = 146 / 941;
const MASCOT_OPAQUE_BOTTOM = 815 / 941;
const MASCOT_OPAQUE_RIGHT = 1081 / 1117;
const MASCOT_PEAK_SCROLL_SCALE = 1.19;

export function MascotScrollScene({ children }) {
  const sceneRef = useRef(null);

  useGSAP(
    () => {
      const scene = sceneRef.current;
      const hero = scene?.querySelector(".hero");
      const secondSection = scene?.querySelector(".what-i-build");
      const kicker = secondSection?.querySelector(".section-kicker");
      const heading = secondSection?.querySelector(".what-i-build-heading");
      const headingCopy = heading?.querySelector("p");
      const buildList = secondSection?.querySelector(".build-list");
      const mascotSticky = secondSection?.querySelector(
        ".mascot-scroll-sticky",
      );
      const mascotImage = secondSection?.querySelector(".mascot-scroll-image");
      if (!scene || !hero || !secondSection) return undefined;

      const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      let pendingFrame = 0;
      let geometryNeedsUpdate = true;

      const updateSafeMascotWidth = () => {
        if (!mascotSticky) return;

        const viewportWidth = Math.max(
          document.documentElement.clientWidth,
          1,
        );
        const viewportHeight = Math.max(window.innerHeight, 1);
        const safeGap = Math.min(24, Math.max(12, viewportHeight * 0.025));
        let safeWidth = Number.POSITIVE_INFINITY;
        const stickyStyles = window.getComputedStyle(mascotSticky);

        if (window.matchMedia("(max-width: 760px)").matches) {
          const mascotTop = Number.parseFloat(stickyStyles.paddingTop) || 0;
          const listTop = buildList?.offsetTop;
          const bottomBoundary = Math.min(
            viewportHeight - safeGap,
            Number.isFinite(listTop) ? listTop - safeGap : viewportHeight,
          );
          const availableVisibleHeight = Math.max(
            1,
            bottomBoundary - mascotTop,
          );

          safeWidth =
            (availableVisibleHeight * MASCOT_SOURCE_ASPECT) /
            MASCOT_OPAQUE_BOTTOM;
        } else {
          const kickerBottom = kicker
            ? kicker.offsetTop + kicker.offsetHeight
            : 0;
          const topBoundary = Math.max(0, kickerBottom) + safeGap;
          const availableVisibleHeight = Math.max(
            1,
            viewportHeight - topBoundary,
          );

          safeWidth =
            (availableVisibleHeight * MASCOT_SOURCE_ASPECT) /
            ((1 - MASCOT_OPAQUE_TOP) * MASCOT_PEAK_SCROLL_SCALE);

          if (heading) {
            const headingLeft = heading.offsetLeft;
            const mascotLeft =
              Number.parseFloat(stickyStyles.paddingLeft) || 0;
            const horizontalCoefficient =
              0.5 +
              MASCOT_PEAK_SCROLL_SCALE * (MASCOT_OPAQUE_RIGHT - 0.5);
            const availableWidth = Math.max(
              1,
              headingLeft - mascotLeft - safeGap,
            );
            safeWidth = Math.min(
              safeWidth,
              availableWidth / horizontalCoefficient,
            );
          }
        }

        scene.style.setProperty(
          "--mascot-safe-max-width",
          `${Math.max(1, Math.min(safeWidth, viewportWidth)).toFixed(2)}px`,
        );
      };

      const getCollisionSafeKickerReveal = (requestedReveal) => {
        if (!kicker || !mascotImage || requestedReveal <= 0) return 0;

        const viewportHeight = Math.max(window.innerHeight, 1);
        const safeGap = Math.min(24, Math.max(12, viewportHeight * 0.025));
        const imageRect = mascotImage.getBoundingClientRect();
        const kickerRect = kicker.getBoundingClientRect();
        const mascotOpaqueTop =
          imageRect.top + imageRect.height * MASCOT_OPAQUE_TOP;
        const clearance = mascotOpaqueTop - kickerRect.bottom - safeGap;
        const clearanceReveal = clamp01(clearance / 24);

        return Math.min(requestedReveal, clearanceReveal);
      };

      const getCollisionSafeTextReveal = (element, mascotReveal) => {
        if (!element || !mascotImage || mascotReveal <= 0.01) return 1;

        const viewportHeight = Math.max(window.innerHeight, 1);
        const safeGap = Math.min(24, Math.max(12, viewportHeight * 0.025));
        const imageRect = mascotImage.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const mascotOpaqueLeft =
          imageRect.left + imageRect.width * (57 / 1117);
        const mascotOpaqueRight =
          imageRect.left + imageRect.width * MASCOT_OPAQUE_RIGHT;
        const overlapsHorizontally =
          mascotOpaqueLeft < elementRect.right &&
          mascotOpaqueRight > elementRect.left;

        if (!overlapsHorizontally) return 1;

        const mascotOpaqueTop =
          imageRect.top + imageRect.height * MASCOT_OPAQUE_TOP;
        const clearance = mascotOpaqueTop - elementRect.bottom - safeGap;

        return clamp01(clearance / 24);
      };

      const writeStaticState = () => {
        scene.style.setProperty("--hero-scroll-progress", "0");
        scene.style.setProperty("--hero-scroll-scale", "1");
        scene.style.setProperty("--mascot-scroll-progress", "1");
        scene.style.setProperty("--mascot-scroll-scale", "1");
        scene.style.setProperty("--mascot-scroll-y", "0px");
        scene.style.setProperty("--mascot-scroll-opacity", "1");
        scene.style.setProperty("--build-kicker-opacity", "1");
        scene.style.setProperty("--build-kicker-y", "0px");
        scene.style.setProperty("--build-copy-opacity", "1");
      };

      const updateProgress = () => {
        pendingFrame = 0;

        if (geometryNeedsUpdate) {
          updateSafeMascotWidth();
          geometryNeedsUpdate = false;
        }

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
          "--build-kicker-y",
          `${((1 - kickerReveal) * 12).toFixed(2)}px`,
        );
        scene.style.setProperty(
          "--build-kicker-opacity",
          getCollisionSafeKickerReveal(kickerReveal).toFixed(4),
        );
        scene.style.setProperty(
          "--build-copy-opacity",
          getCollisionSafeTextReveal(headingCopy, mascotReveal).toFixed(4),
        );
      };

      const requestUpdate = () => {
        if (pendingFrame) return;
        pendingFrame = window.requestAnimationFrame(updateProgress);
      };

      const requestGeometryUpdate = () => {
        geometryNeedsUpdate = true;
        requestUpdate();
      };

      const resizeObserver = new ResizeObserver(requestGeometryUpdate);
      resizeObserver.observe(hero);
      resizeObserver.observe(secondSection);
      if (kicker) resizeObserver.observe(kicker);
      if (heading) resizeObserver.observe(heading);
      if (buildList) resizeObserver.observe(buildList);
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestGeometryUpdate, {
        passive: true,
      });
      reducedMotionQuery.addEventListener("change", requestGeometryUpdate);
      updateProgress();

      return () => {
        if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
        resizeObserver.disconnect();
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestGeometryUpdate);
        reducedMotionQuery.removeEventListener("change", requestGeometryUpdate);
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
