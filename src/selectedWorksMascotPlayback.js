export function setupSelectedWorksMascot({
  root,
  video,
  canvas,
  firstImage,
  finalImage,
  lifecycle,
  onStateChange,
}) {
  const document = root.ownerDocument;
  const window = document.defaultView;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const context = canvas.getContext("2d");
  let loadObserver;
  let playbackObserver;
  let isVisible = false;
  let isAttemptingPlayback = false;
  let autoplayBlocked = false;
  let firstFramePrepared = false;
  let finalFramePrepared = false;
  let finalFrameDecodePromise;
  let videoFrameCallbackId;
  let animationFrameId;
  let gestureRetryCleanup;
  let fallbackVisibilityCleanup;
  let isDisposed = false;

  const markState = (name) => {
    if (isDisposed || lifecycle[name]) return;
    lifecycle[name] = true;
    onStateChange(name);
  };

  const drawFrame = (source) => {
    if (!context || isDisposed || !source) return false;

    try {
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      return true;
    } catch {
      return false;
    }
  };

  const prepareFirstFrame = () => {
    if (!firstImage || firstFramePrepared) return;
    firstFramePrepared = true;
    firstImage.loading = "eager";
    firstImage.decode?.()
      .then(() => {
        if (
          !reducedMotion.matches &&
          !lifecycle.hasPresentedFirstFrame &&
          !lifecycle.hasEnded
        ) {
          drawFrame(firstImage);
        }
      })
      .catch(() => {});
  };

  const drawFinalFrame = () => {
    if (!finalImage) return;
    const draw = () => drawFrame(finalImage);

    if (finalImage.complete && finalImage.naturalWidth > 0) {
      draw();
      return;
    }

    prepareFinalFrame()?.then(draw).catch(() => {});
  };

  const prepareFinalFrame = () => {
    if (!finalImage) return undefined;
    if (finalFramePrepared) return finalFrameDecodePromise;
    finalFramePrepared = true;
    finalImage.loading = "eager";
    finalFrameDecodePromise = finalImage.decode?.() ?? Promise.resolve();
    finalFrameDecodePromise.catch(() => {});
    return finalFrameDecodePromise;
  };

  const prepareVideo = () => {
    prepareFirstFrame();
    video.preload = "auto";
  };

  const cancelFrameRendering = () => {
    if (videoFrameCallbackId !== undefined) {
      video.cancelVideoFrameCallback?.(videoFrameCallbackId);
      videoFrameCallbackId = undefined;
    }
    if (animationFrameId !== undefined) {
      window.cancelAnimationFrame?.(animationFrameId);
      animationFrameId = undefined;
    }
  };

  const renderVideoFrame = () => {
    if (
      isDisposed || lifecycle.hasEnded || reducedMotion.matches ||
      document.hidden || !isVisible || video.paused || video.readyState < 2
    ) return;

    if (video.videoWidth !== 0 && drawFrame(video)) {
      markState("hasPresentedFirstFrame");
    }
  };

  const scheduleFrameRendering = () => {
    if (
      isDisposed || lifecycle.hasEnded || reducedMotion.matches ||
      document.hidden || !isVisible || video.paused ||
      videoFrameCallbackId !== undefined || animationFrameId !== undefined
    ) return;

    if (typeof video.requestVideoFrameCallback === "function") {
      videoFrameCallbackId = video.requestVideoFrameCallback(() => {
        videoFrameCallbackId = undefined;
        renderVideoFrame();
        scheduleFrameRendering();
      });
      return;
    }

    if (typeof window.requestAnimationFrame !== "function") return;
    animationFrameId = window.requestAnimationFrame(() => {
      animationFrameId = undefined;
      renderVideoFrame();
      scheduleFrameRendering();
    });
  };

  const registerGestureRetry = () => {
    if (gestureRetryCleanup || lifecycle.hasEnded || isDisposed) return;
    const retry = () => {
      if (!isVisible || document.hidden) return;
      gestureRetryCleanup?.();
      autoplayBlocked = false;
      attemptPlayback();
    };
    gestureRetryCleanup = () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      gestureRetryCleanup = undefined;
    };
    window.addEventListener("pointerdown", retry, { passive: true });
    window.addEventListener("keydown", retry);
  };

  const attemptPlayback = async () => {
    if (
      isDisposed || reducedMotion.matches || document.hidden || !isVisible ||
      lifecycle.hasEnded || video.ended || video.error || autoplayBlocked ||
      isAttemptingPlayback || !video.paused
    ) return;

    prepareVideo();

    isAttemptingPlayback = true;
    video.defaultMuted = true;
    video.muted = true;
    try {
      await video.play();
      if (!isDisposed) {
        markState("hasStarted");
        scheduleFrameRendering();
        gestureRetryCleanup?.();
      }
    } catch (error) {
      if (!isDisposed) {
        autoplayBlocked = error?.name === "NotAllowedError";
        registerGestureRetry();
      }
    } finally {
      isAttemptingPlayback = false;
    }
  };

  const handleLoadedData = () => {
    markState("hasLoaded");
    attemptPlayback();
  };
  const handleProgress = () => attemptPlayback();
  const handlePlaying = () => {
    markState("hasStarted");
    scheduleFrameRendering();
    gestureRetryCleanup?.();
  };
  const handleEnded = () => {
    cancelFrameRendering();
    drawFinalFrame();
    markState("hasEnded");
    gestureRetryCleanup?.();
    loadObserver?.disconnect();
    playbackObserver?.disconnect();
    fallbackVisibilityCleanup?.();
  };
  const handlePause = () => {
    cancelFrameRendering();
    if (lifecycle.hasStarted && !video.ended && !reducedMotion.matches) {
      registerGestureRetry();
    }
  };
  const handleMotionChange = () => {
    if (reducedMotion.matches) {
      cancelFrameRendering();
      gestureRetryCleanup?.();
      prepareFinalFrame();
      drawFinalFrame();
      video.pause();
    } else {
      attemptPlayback();
    }
  };
  const handleVisibilityChange = () => {
    cancelFrameRendering();
    if (!document.hidden) {
      scheduleFrameRendering();
      attemptPlayback();
    }
  };
  const handlePageShow = () => {
    scheduleFrameRendering();
    attemptPlayback();
  };

  video.addEventListener("loadeddata", handleLoadedData);
  video.addEventListener("canplay", attemptPlayback);
  video.addEventListener("progress", handleProgress);
  video.addEventListener("playing", handlePlaying);
  video.addEventListener("pause", handlePause);
  video.addEventListener("ended", handleEnded);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pageshow", handlePageShow);
  reducedMotion.addEventListener("change", handleMotionChange);

  // Begin the single progressive request immediately; load() is deliberately
  // avoided because it would discard an already downloaded buffer.
  prepareVideo();
  if (video.readyState >= 2) handleLoadedData();
  if (video.ended) handleEnded();
  if (reducedMotion.matches) {
    prepareFinalFrame();
    drawFinalFrame();
  }

  if (!lifecycle.hasEnded && "IntersectionObserver" in window) {
    loadObserver = new window.IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      prepareFinalFrame();
      loadObserver.disconnect();
    }, { rootMargin: "160% 0px", threshold: 0 });
    playbackObserver = new window.IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
      if (isVisible) scheduleFrameRendering();
      else cancelFrameRendering();
      attemptPlayback();
    }, { threshold: [0, 0.18] });
    loadObserver.observe(root);
    playbackObserver.observe(root);
  } else if (!lifecycle.hasEnded) {
    const checkVisibility = () => {
      const bounds = root.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 2.6) prepareFinalFrame();
      isVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
      if (isVisible) scheduleFrameRendering();
      else cancelFrameRendering();
      attemptPlayback();
    };
    fallbackVisibilityCleanup = () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);
    checkVisibility();
  }

  return () => {
    isDisposed = true;
    cancelFrameRendering();
    loadObserver?.disconnect();
    playbackObserver?.disconnect();
    fallbackVisibilityCleanup?.();
    gestureRetryCleanup?.();
    video.removeEventListener("loadeddata", handleLoadedData);
    video.removeEventListener("canplay", attemptPlayback);
    video.removeEventListener("progress", handleProgress);
    video.removeEventListener("playing", handlePlaying);
    video.removeEventListener("pause", handlePause);
    video.removeEventListener("ended", handleEnded);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pageshow", handlePageShow);
    reducedMotion.removeEventListener("change", handleMotionChange);
  };
}
