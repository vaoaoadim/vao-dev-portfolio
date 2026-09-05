import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BeautyBombGamePopup } from "./BeautyBombGamePopup";
import { useLanguage } from "./LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const CASE_COUNT = 8;
const GAME_TAP_TOLERANCE = 10;

const PROJECT_COVERS = {
  planer: {
    avif: "/assets/selected-works/planer-cover-v2.avif",
    webp: "/assets/selected-works/planer-cover-v2.webp",
    png: "/assets/selected-works/planer-cover-v2.png",
    label: "Pläner",
  },
  beautybomb: {
    avif: "/assets/selected-works/beautybomb-delivery-cover-v1.avif",
    webp: "/assets/selected-works/beautybomb-delivery-cover-v1.webp",
    png: "/assets/selected-works/beautybomb-delivery-cover-v1.png",
  },
};

const SCRAMBLE_SYMBOLS = "[]{}<>/\\|!@#$%^&*+=-~?:;";

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

function formatCase(index, prefix) {
  return `${prefix} ${String(index + 1).padStart(2, "0")}`;
}

function previewLabel(index) {
  return `preview_${String(index + 1).padStart(2, "0")}.png`;
}

const PORTFOLIO_MEDIA_WARMUP = [
  {
    sources: Object.values(PROJECT_COVERS.planer),
    priority: "low",
  },
  {
    sources: Object.values(PROJECT_COVERS.beautybomb),
    priority: "low",
  },
  {
    sources: [
      "/assets/work-pendants/floppy-disk.webp",
      "/assets/work-pendants/floppy-disk.png",
    ],
    priority: "auto",
  },
  {
    sources: [
      "/assets/work-pendants/ball-mouse.webp",
      "/assets/work-pendants/ball-mouse.png",
    ],
    priority: "auto",
  },
];

const warmedPortfolioMedia = new Map();

function warmupPortfolioImage({ sources, priority }) {
  const key = sources.join("|");
  const cached = warmedPortfolioMedia.get(key);

  if (cached) return cached.promise;

  const image = new Image();
  let sourceIndex = 0;

  image.decoding = "async";
  image.fetchPriority = priority;

  const promise = new Promise((resolve) => {
    const complete = async () => {
      try {
        await image.decode?.();
      } catch {
        // A completed image is still usable when decode() is unavailable.
      }

      image.onload = null;
      image.onerror = null;
      resolve(image);
    };

    const tryNextSource = () => {
      sourceIndex += 1;

      if (sourceIndex >= sources.length) {
        image.onload = null;
        image.onerror = null;
        resolve(null);
        return;
      }

      image.src = sources[sourceIndex];
    };

    image.onload = complete;
    image.onerror = tryNextSource;
    image.src = sources[sourceIndex];
  });

  warmedPortfolioMedia.set(key, { image, promise });
  return promise;
}

function warmupPortfolioMedia() {
  PORTFOLIO_MEDIA_WARMUP.forEach((asset) => {
    void warmupPortfolioImage(asset);
  });
}

function WorkPendants() {
  const rootRef = useRef(null);
  const floppyRef = useRef(null);
  const mouseRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const floppy = floppyRef.current;
      const mouse = mouseRef.current;

      if (!root || !floppy || !mouse) return undefined;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        gsap.set([floppy, mouse], { rotation: 0 });
        return undefined;
      }

      const pendulums = [
        {
          node: floppy,
          angle: 0.078,
          velocity: 0,
          gravity: 8.2,
          damping: 0.34,
          idleAmplitude: 0.026,
          idleRate: 0.69,
          phase: 0.4,
          pointerForce: 0,
        },
        {
          node: mouse,
          angle: -0.061,
          velocity: 0,
          gravity: 6.7,
          damping: 0.3,
          idleAmplitude: 0.022,
          idleRate: 0.57,
          phase: 2.1,
          pointerForce: 0,
        },
      ].map((pendulum) => ({
        ...pendulum,
        setRotation: gsap.quickSetter(pendulum.node, "rotation", "deg"),
      }));

      let isVisible = true;

      const visibilityObserver =
        "IntersectionObserver" in window
          ? new IntersectionObserver(
              ([entry]) => {
                isVisible = entry.isIntersecting;
              },
              { rootMargin: "12% 0px" },
            )
          : null;

      visibilityObserver?.observe(root);

      const tick = (time, deltaTime) => {
        if (!isVisible) return;

        const delta = Math.min(deltaTime / 1000, 1 / 30);

        pendulums.forEach((pendulum) => {
          const idleAngle =
            pendulum.idleAmplitude *
            (Math.sin(time * pendulum.idleRate + pendulum.phase) +
              Math.sin(
                time * pendulum.idleRate * 0.43 + pendulum.phase * 1.7,
              ) *
                0.32);
          const acceleration =
            -pendulum.gravity * Math.sin(pendulum.angle - idleAngle) -
            pendulum.damping * pendulum.velocity +
            pendulum.pointerForce;

          pendulum.velocity += acceleration * delta;
          pendulum.angle += pendulum.velocity * delta;
          pendulum.pointerForce *= Math.exp(-4.2 * delta);

          if (Math.abs(pendulum.angle) > 0.22) {
            pendulum.angle = Math.sign(pendulum.angle) * 0.22;
            pendulum.velocity *= -0.24;
          }

          pendulum.setRotation((pendulum.angle * 180) / Math.PI);
        });
      };

      const pointerCleanups = [];

      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        pendulums.forEach((pendulum) => {
          const target = pendulum.node.querySelector(
            ".work-pendant__object",
          );

          if (!target) return;

          let previousPointerX = null;
          let previousPointerTime = 0;

          const applyPointerImpulse = (event) => {
            const bounds = target.getBoundingClientRect();
            const halfWidth = Math.max(1, bounds.width / 2);
            const pointerOffset = clamp(
              (event.clientX - (bounds.left + halfWidth)) / halfWidth,
              -1,
              1,
            );
            const elapsed = previousPointerTime
              ? Math.max(8, event.timeStamp - previousPointerTime)
              : 16;
            const pointerVelocity =
              previousPointerX === null
                ? 0
                : ((event.clientX - previousPointerX) / elapsed) * 1000;
            const fallbackDirection =
              Math.sign(pointerVelocity) || (pendulum.angle <= 0 ? 1 : -1);
            const direction =
              Math.abs(pointerOffset) > 0.08
                ? pointerOffset
                : fallbackDirection;
            const speedBoost = clamp(
              Math.abs(pointerVelocity) / 1800,
              0,
              0.2,
            );

            pendulum.pointerForce = clamp(
              pendulum.pointerForce + direction * (0.2 + speedBoost),
              -0.56,
              0.56,
            );
            previousPointerX = event.clientX;
            previousPointerTime = event.timeStamp;
          };

          const resetPointerSample = () => {
            previousPointerX = null;
            previousPointerTime = 0;
          };

          target.addEventListener("pointerenter", applyPointerImpulse, {
            passive: true,
          });
          target.addEventListener("pointermove", applyPointerImpulse, {
            passive: true,
          });
          target.addEventListener("pointerleave", resetPointerSample);

          pointerCleanups.push(() => {
            target.removeEventListener("pointerenter", applyPointerImpulse);
            target.removeEventListener("pointermove", applyPointerImpulse);
            target.removeEventListener("pointerleave", resetPointerSample);
          });
        });
      }

      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        visibilityObserver?.disconnect();
        pointerCleanups.forEach((cleanup) => cleanup());
      };
    },
    { scope: rootRef },
  );

  return (
    <span ref={rootRef} className="work-pendants" aria-hidden="true">
      <span
        ref={floppyRef}
        className="work-pendant work-pendant--floppy"
      >
        <span className="work-pendant__wire" />
        <picture>
          <source srcSet="/assets/work-pendants/floppy-disk.webp" type="image/webp" />
          <img
            className="work-pendant__object"
            src="/assets/work-pendants/floppy-disk.png"
            alt=""
            draggable="false"
            width="880"
            height="1028"
            loading="eager"
            decoding="async"
            fetchPriority="auto"
          />
        </picture>
      </span>
      <span ref={mouseRef} className="work-pendant work-pendant--mouse">
        <span className="work-pendant__wire" />
        <picture>
          <source srcSet="/assets/work-pendants/ball-mouse.webp" type="image/webp" />
          <img
            className="work-pendant__object"
            src="/assets/work-pendants/ball-mouse.png"
            alt=""
            draggable="false"
            width="533"
            height="930"
            loading="eager"
            decoding="async"
            fetchPriority="auto"
          />
        </picture>
      </span>
    </span>
  );
}

function SelectedWorksMascot() {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const lifecycleRef = useRef({
    hasLoaded: false,
    hasStarted: false,
    hasEnded: false,
  });
  const [playbackState, setPlaybackState] = useState(
    lifecycleRef.current,
  );

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;

    if (!root || !video) return undefined;

    const lifecycle = lifecycleRef.current;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let loadObserver = null;
    let playbackObserver = null;
    let isAttemptingPlayback = false;
    let retryWasUsed = false;
    let fallbackVisibilityCleanup = null;
    let gestureRetryCleanup = null;
    let isDisposed = false;

    const markLifecycleState = (stateName) => {
      if (lifecycle[stateName]) return;

      lifecycle[stateName] = true;
      setPlaybackState((currentState) => ({
        ...currentState,
        [stateName]: true,
      }));
    };

    const handleLoadedData = () => {
      markLifecycleState("hasLoaded");
    };

    const handleEnded = () => {
      markLifecycleState("hasEnded");
      gestureRetryCleanup?.();
    };

    const prepareVideo = () => {
      if (video.preload === "auto") return;

      video.preload = "auto";
      video.load();
    };

    const registerGestureRetry = (attemptPlayback) => {
      if (gestureRetryCleanup || retryWasUsed || lifecycle.hasStarted) {
        return;
      }

      const retryPlayback = () => {
        retryWasUsed = true;
        gestureRetryCleanup?.();
        attemptPlayback(false);
      };

      gestureRetryCleanup = () => {
        window.removeEventListener("pointerdown", retryPlayback);
        window.removeEventListener("keydown", retryPlayback);
        gestureRetryCleanup = null;
      };

      window.addEventListener("pointerdown", retryPlayback, {
        once: true,
        passive: true,
      });
      window.addEventListener("keydown", retryPlayback, { once: true });
    };

    const attemptPlayback = async (canRegisterRetry = true) => {
      if (
        isDisposed ||
        reducedMotionQuery.matches ||
        lifecycle.hasStarted ||
        lifecycle.hasEnded ||
        isAttemptingPlayback
      ) {
        return;
      }

      isAttemptingPlayback = true;
      prepareVideo();
      video.defaultMuted = true;
      video.muted = true;

      try {
        await video.play();

        if (!isDisposed) {
          markLifecycleState("hasStarted");
          gestureRetryCleanup?.();
        }
      } catch {
        if (!isDisposed && canRegisterRetry) {
          registerGestureRetry(attemptPlayback);
        }
      } finally {
        isAttemptingPlayback = false;
      }
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      handleLoadedData();
    }

    if (!reducedMotionQuery.matches && "IntersectionObserver" in window) {
      loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          prepareVideo();
          loadObserver?.disconnect();
        },
        { rootMargin: "120% 0px", threshold: 0 },
      );

      playbackObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.18) {
            return;
          }

          attemptPlayback();
          playbackObserver?.disconnect();
        },
        { threshold: [0, 0.18] },
      );

      loadObserver.observe(root);
      playbackObserver.observe(root);
    } else if (!reducedMotionQuery.matches) {
      const checkFallbackVisibility = () => {
        const bounds = root.getBoundingClientRect();

        if (bounds.top < window.innerHeight * 2) {
          prepareVideo();
        }

        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
          attemptPlayback();
          fallbackVisibilityCleanup?.();
        }
      };

      fallbackVisibilityCleanup = () => {
        window.removeEventListener("scroll", checkFallbackVisibility);
        window.removeEventListener("resize", checkFallbackVisibility);
        fallbackVisibilityCleanup = null;
      };

      window.addEventListener("scroll", checkFallbackVisibility, {
        passive: true,
      });
      window.addEventListener("resize", checkFallbackVisibility);
      checkFallbackVisibility();
    }

    return () => {
      isDisposed = true;
      loadObserver?.disconnect();
      playbackObserver?.disconnect();
      fallbackVisibilityCleanup?.();
      gestureRetryCleanup?.();
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <span
      ref={rootRef}
      className="selected-works__mascot-media"
      data-loaded={playbackState.hasLoaded}
      data-started={playbackState.hasStarted}
      data-ended={playbackState.hasEnded}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="selected-works__mascot-video"
        poster="/assets/selected-works/selected-work-mascot-first.png?v=steps-2800-crop660"
        preload="metadata"
        muted
        playsInline
        disablePictureInPicture
        tabIndex={-1}
      >
        <source
          src="/assets/selected-works/selected-work-mascot.mp4?v=steps-2800-crop660"
          type="video/mp4"
        />
      </video>
      <img
        className="selected-works__mascot-final"
        src="/assets/selected-works/selected-work-mascot-last.png?v=steps-2800-crop660"
        alt=""
        width="660"
        height="720"
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </span>
  );
}

function WorkCasePreview({
  project,
  index,
  copy,
  interpolate,
  gameTriggerRef,
  openGame,
  handleGamePointerDown,
  handleGamePointerUp,
  handleGamePointerCancel,
}) {
  const isEmbeddedGame = project.interaction === "embedded-game";
  const isExternalProject = Boolean(project.href);
  const cover = project.cover ? PROJECT_COVERS[project.cover] : null;
  const PreviewTag = isExternalProject ? "a" : "button";
  const previewProps = isExternalProject
    ? {
        href: project.href,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {
        type: "button",
        onClick: isEmbeddedGame ? openGame : undefined,
        onPointerDown: isEmbeddedGame ? handleGamePointerDown : undefined,
        onPointerUp: isEmbeddedGame ? handleGamePointerUp : undefined,
        onPointerCancel: isEmbeddedGame ? handleGamePointerCancel : undefined,
      };

  return (
    <PreviewTag
      ref={isEmbeddedGame ? gameTriggerRef : undefined}
      className="work-case__preview"
      data-cursor="interactive"
      aria-label={
        isExternalProject
          ? copy.works.openProjectAria
          : isEmbeddedGame
            ? interpolate(copy.works.playGame, { title: project.title })
            : interpolate(copy.works.previewSoon, { title: project.title })
      }
      {...previewProps}
    >
      <span className="work-case__corner work-case__corner--top-left" aria-hidden="true" />
      <span className="work-case__corner work-case__corner--top-right" aria-hidden="true" />
      <span className="work-case__corner work-case__corner--bottom-left" aria-hidden="true" />
      <span className="work-case__corner work-case__corner--bottom-right" aria-hidden="true" />
      <span
        className={`work-case__preview-canvas${
          cover ? " work-case__preview-canvas--cover" : ""
        }`}
        data-cover={project.cover}
        aria-hidden={cover ? undefined : "true"}
      >
        {cover ? (
          <picture className="work-case__cover-picture">
            <source srcSet={cover.avif} type="image/avif" />
            <source srcSet={cover.webp} type="image/webp" />
            <img
              className="work-case__cover-image"
              src={cover.png}
              alt={project.coverAlt}
              width="1584"
              height="990"
              loading="eager"
              decoding="async"
              fetchPriority="low"
              draggable="false"
            />
          </picture>
        ) : (
          <>
            <span className="work-case__preview-file">{previewLabel(index)}</span>
            <span className="work-case__preview-window">
              <span />
              <span />
              <span />
            </span>
            <span className="work-case__preview-title">{copy.works.previewTitle}</span>
            <span className="work-case__preview-note">{copy.works.previewNote}</span>
          </>
        )}
        {cover?.label ? (
          <span className="work-case__cover-title" aria-hidden="true">
            {cover.label}
          </span>
        ) : null}
      </span>
      <span className="work-case__open-label" aria-hidden="true">
        {isExternalProject ? copy.works.openProject : copy.works.openCase}
      </span>
    </PreviewTag>
  );
}

export function SelectedWorks() {
  const { copy, interpolate } = useLanguage();
  const [isGameOpen, setIsGameOpen] = useState(false);
  const gameTriggerRef = useRef(null);
  const gameTapRef = useRef(null);
  const sectionRef = useRef(null);
  const galleryRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const caseLabelRef = useRef(null);
  const activeCaseRef = useRef(0);
  const nativeProgressFrameRef = useRef(0);
  const casePrefixRef = useRef(copy.works.casePrefix);
  casePrefixRef.current = copy.works.casePrefix;

  useEffect(() => {
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(warmupPortfolioMedia);
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const openGame = useCallback(() => setIsGameOpen(true), []);
  const closeGame = useCallback(() => setIsGameOpen(false), []);

  const handleGamePointerDown = useCallback((event) => {
    if (
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    gameTapRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const handleGamePointerUp = useCallback(
    (event) => {
      const tap = gameTapRef.current;
      gameTapRef.current = null;

      if (!tap || tap.pointerId !== event.pointerId) return;

      const distance = Math.hypot(
        event.clientX - tap.x,
        event.clientY - tap.y,
      );

      if (distance <= GAME_TAP_TOLERANCE) openGame();
    },
    [openGame],
  );

  const handleGamePointerCancel = useCallback((event) => {
    if (gameTapRef.current?.pointerId === event.pointerId) {
      gameTapRef.current = null;
    }
  }, []);

  const handleNativeScroll = (event) => {
    if (
      window.matchMedia(
        "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
      ).matches
    ) {
      return;
    }

    const viewport = event.currentTarget;

    if (nativeProgressFrameRef.current) {
      window.cancelAnimationFrame(nativeProgressFrameRef.current);
    }

    nativeProgressFrameRef.current = window.requestAnimationFrame(() => {
      nativeProgressFrameRef.current = 0;

      const maximumScroll = Math.max(
        1,
        viewport.scrollWidth - viewport.clientWidth,
      );
      const progress = viewport.scrollLeft / maximumScroll;
      const index = Math.round(progress * (CASE_COUNT - 1));

      sectionRef.current?.style.setProperty(
        "--works-progress",
        clamp(progress, 0, 1).toFixed(4),
      );
      activeCaseRef.current = index;

      if (caseLabelRef.current) {
        caseLabelRef.current.textContent = formatCase(index, casePrefixRef.current);
      }
    });
  };

  useEffect(
    () => () => {
      if (nativeProgressFrameRef.current) {
        window.cancelAnimationFrame(nativeProgressFrameRef.current);
      }
    },
    [],
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const gallery = galleryRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const caseLabel = caseLabelRef.current;

      if (!section || !gallery || !viewport || !track || !caseLabel) {
        return undefined;
      }

      const panels = gsap.utils.toArray(".work-case");
      const setProgress = (progress) => {
        section.style.setProperty("--works-progress", clamp(progress, 0, 1).toFixed(4));
      };

      const setCaseLabel = (index, shouldScramble = false) => {
        const nextIndex = clamp(index, 0, CASE_COUNT - 1);
        const nextLabel = formatCase(nextIndex, casePrefixRef.current);

        if (activeCaseRef.current === nextIndex && caseLabel.textContent === nextLabel) {
          return;
        }

        activeCaseRef.current = nextIndex;
        gsap.killTweensOf(caseLabel);

        if (
          !shouldScramble ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          caseLabel.textContent = nextLabel;
          return;
        }

        const state = { progress: 0 };
        gsap.to(state, {
          progress: 1,
          duration: 0.22,
          ease: "none",
          overwrite: true,
          onUpdate: () => {
            const revealedDigits = Math.floor(state.progress * 2);
            const digits = nextLabel.slice(-2)
              .split("")
              .map((digit, digitIndex) => {
                if (digitIndex < revealedDigits) return digit;
                return SCRAMBLE_SYMBOLS[
                  Math.floor(Math.random() * SCRAMBLE_SYMBOLS.length)
                ];
              })
              .join("");
            caseLabel.textContent = `CASE ${digits}`;
          },
          onComplete: () => {
            caseLabel.textContent = nextLabel;
          },
        });
      };

      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 761px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduced } = context.conditions;
          activeCaseRef.current = 0;
          caseLabel.textContent = formatCase(0, casePrefixRef.current);
          setProgress(0);

          if (!desktop || reduced) {
            return undefined;
          }

          gsap.set(track, { x: 0 });
          const travelDistance = () =>
            Math.max(0, track.scrollWidth - gallery.clientWidth);

          const horizontalTween = gsap.to(track, {
            x: () => -travelDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: gallery,
              start: "top top",
              end: () => `+=${travelDistance()}`,
              pin: true,
              scrub: 0.32,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              onUpdate: (trigger) => setProgress(trigger.progress),
            },
          });

          panels.forEach((panel, index) => {
            const visual = panel.querySelector(".work-case__visual");
            const direction = index % 2 === 0 ? 1 : -1;

            gsap.fromTo(
              visual,
              {
                x: direction * 28,
                scale: 0.9,
                rotation: direction * 0.8,
              },
              {
                x: -direction * 18,
                scale: 0.96,
                rotation: -direction * 0.45,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: horizontalTween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );

            ScrollTrigger.create({
              trigger: panel,
              containerAnimation: horizontalTween,
              start: "left 58%",
              end: "right 42%",
              onEnter: () => setCaseLabel(index, index !== 0),
              onEnterBack: () => setCaseLabel(index, true),
            });
          });

          return () => {
            gsap.set(track, { clearProps: "transform" });
          };
        },
      );

      media.add(
        {
          mobile: "(max-width: 760px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (mobileContext) => {
          const { mobile, motion } = mobileContext.conditions;

          if (!mobile || !motion) return undefined;

          let isGalleryVisible = false;
          let userHasSwiped = false;
          let repeatTimer = 0;
          let hintTimeline = null;

          const clearHintTimer = () => {
            if (repeatTimer) {
              window.clearTimeout(repeatTimer);
              repeatTimer = 0;
            }
          };

          const cancelMobileSwipeHint = () => {
            clearHintTimer();
            hintTimeline?.kill();
            hintTimeline = null;
            gsap.killTweensOf(viewport, "scrollLeft");
            delete viewport.dataset.swipeHint;
          };

          const scheduleMobileSwipeHint = (delay = 550) => {
            clearHintTimer();

            if (!isGalleryVisible || userHasSwiped || viewport.scrollLeft > 2) {
              return;
            }

            repeatTimer = window.setTimeout(() => {
              repeatTimer = 0;

              if (!isGalleryVisible || userHasSwiped || viewport.scrollLeft > 2) {
                return;
              }

              const peekDistance = Math.round(
                Math.min(56, viewport.clientWidth * 0.16),
              );

              hintTimeline = gsap
                .timeline({
                  onStart: () => {
                    viewport.dataset.swipeHint = "true";
                  },
                  onComplete: () => {
                    delete viewport.dataset.swipeHint;
                    hintTimeline = null;
                    scheduleMobileSwipeHint(2300);
                  },
                })
                .to(viewport, {
                  scrollLeft: peekDistance,
                  duration: 0.72,
                  ease: "power1.inOut",
                })
                .to(viewport, {
                  scrollLeft: peekDistance * 0.62,
                  duration: 0.28,
                  ease: "power1.inOut",
                })
                .to(viewport, {
                  scrollLeft: peekDistance,
                  duration: 0.32,
                  ease: "power1.inOut",
                })
                .to(viewport, {
                  scrollLeft: 0,
                  duration: 0.72,
                  ease: "power2.inOut",
                });
            }, delay);
          };

          const stopHintAfterHorizontalSwipe = () => {
            if (viewport.dataset.swipeHint === "true") return;

            const swipeThreshold = Math.max(18, viewport.clientWidth * 0.06);

            if (viewport.scrollLeft < swipeThreshold) return;

            userHasSwiped = true;
            section.dataset.swipeHintDismissed = "true";
            cancelMobileSwipeHint();
          };

          const stopHintOnUserIntent = (event) => {
            if (viewport.dataset.swipeHint !== "true") return;

            if (
              event.type === "wheel" &&
              Math.abs(event.deltaX) <= Math.abs(event.deltaY) &&
              !event.shiftKey
            ) {
              return;
            }

            userHasSwiped = true;
            section.dataset.swipeHintDismissed = "true";
            cancelMobileSwipeHint();
          };

          const hintTrigger = ScrollTrigger.create({
            trigger: gallery,
            start: "top 74%",
            end: "bottom 26%",
            onEnter: () => {
              isGalleryVisible = true;
              scheduleMobileSwipeHint();
            },
            onEnterBack: () => {
              isGalleryVisible = true;
              scheduleMobileSwipeHint();
            },
            onLeave: () => {
              isGalleryVisible = false;
              cancelMobileSwipeHint();
            },
            onLeaveBack: () => {
              isGalleryVisible = false;
              cancelMobileSwipeHint();
            },
          });

          viewport.addEventListener("scroll", stopHintAfterHorizontalSwipe, {
            passive: true,
          });
          viewport.addEventListener("pointerdown", stopHintOnUserIntent, {
            passive: true,
          });
          viewport.addEventListener("touchstart", stopHintOnUserIntent, {
            passive: true,
          });
          viewport.addEventListener("wheel", stopHintOnUserIntent, {
            passive: true,
          });

          return () => {
            hintTrigger.kill();
            viewport.removeEventListener("scroll", stopHintAfterHorizontalSwipe);
            viewport.removeEventListener("pointerdown", stopHintOnUserIntent);
            viewport.removeEventListener("touchstart", stopHintOnUserIntent);
            viewport.removeEventListener("wheel", stopHintOnUserIntent);
            cancelMobileSwipeHint();
          };
        },
      );

      return () => {
        media.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="selected-works" id="work" aria-labelledby="works-title">
      <div className="selected-works__intro">
        <p className="selected-works__kicker">
          <span>02</span>
          <span>{copy.works.kicker}</span>
        </p>
        <h2 id="works-title">
          <span className="selected-works__title-stage">
            <SelectedWorksMascot />
            <span className="selected-works__selected-line">{copy.works.titleFirst}</span>
          </span>
          <span className="selected-works__work-line">
            {copy.works.titleSecond.before}
            <span className="selected-works__o">
              {copy.works.titleSecond.focus}
              <WorkPendants />
            </span>
            {copy.works.titleSecond.after}
          </span>
        </h2>
      </div>

      <div ref={galleryRef} className="works-gallery" aria-label={copy.works.galleryLabel}>
        <div className="works-gallery__status" aria-live="polite">
          <span ref={caseLabelRef}>{formatCase(0, copy.works.casePrefix)}</span>
        </div>
        <span className="works-gallery__swipe-label" aria-hidden="true">
          {copy.works.swipe}
        </span>

        <div
          ref={viewportRef}
          className="works-gallery__viewport"
          onScroll={handleNativeScroll}
        >
          <div ref={trackRef} className="works-gallery__track">
            {copy.works.cases.map((project, index) => (
              <article
                key={project.id}
                className={`work-case work-case--${project.color}`}
                aria-label={`${formatCase(index, copy.works.casePrefix)}: ${project.title}`}
              >
                <div className="work-case__visual">
                  <WorkCasePreview
                    project={project}
                    index={index}
                    copy={copy}
                    interpolate={interpolate}
                    gameTriggerRef={gameTriggerRef}
                    openGame={openGame}
                    handleGamePointerDown={handleGamePointerDown}
                    handleGamePointerUp={handleGamePointerUp}
                    handleGamePointerCancel={handleGamePointerCancel}
                  />
                </div>

                <div className="work-case__meta">
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.type}</p>
                  </div>
                  <p className="work-case__description">{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="works-gallery__progress" aria-hidden="true">
          <span>01</span>
          <div className="works-gallery__progress-line">
            <i />
          </div>
          <span>08</span>
        </div>
      </div>

      <BeautyBombGamePopup
        open={isGameOpen}
        onClose={closeGame}
        triggerRef={gameTriggerRef}
      />
    </section>
  );
}
