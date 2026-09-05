export function setupSelectedWorksMascot({
  root,
  video,
  finalImage,
  lifecycle,
  onStateChange,
}) {
  const document = root.ownerDocument;
  const window = document.defaultView;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let loadObserver;
  let playbackObserver;
  let isVisible = false;
  let isAttemptingPlayback = false;
  let autoplayBlocked = false;
  let finalFramePrepared = false;
  let gestureRetryCleanup;
  let fallbackVisibilityCleanup;
  let isDisposed = false;

  const markState = (name) => {
    if (isDisposed || lifecycle[name]) return;
    lifecycle[name] = true;
    onStateChange(name);
  };

  const prepareFinalFrame = () => {
    if (!finalImage || finalFramePrepared) return;
    finalFramePrepared = true;
    finalImage.loading = "eager";
    // Decode before the end transition without delaying video playback.
    finalImage.decode?.().catch(() => {});
  };

  const prepareVideo = () => {
    prepareFinalFrame();
    // Promoting preload keeps the existing request/buffer. load() would reset it.
    video.preload = "auto";
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

    isAttemptingPlayback = true;
    prepareVideo();
    video.defaultMuted = true;
    video.muted = true;
    try {
      await video.play();
      if (!isDisposed) {
        markState("hasStarted");
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

  const handleLoadedData = () => markState("hasLoaded");
  const handlePlaying = () => {
    markState("hasStarted");
    gestureRetryCleanup?.();
  };
  const handleEnded = () => {
    markState("hasEnded");
    gestureRetryCleanup?.();
    loadObserver?.disconnect();
    playbackObserver?.disconnect();
    fallbackVisibilityCleanup?.();
  };
  const handlePause = () => {
    if (lifecycle.hasStarted && !video.ended) registerGestureRetry();
  };
  const handleMotionChange = () => {
    if (reducedMotion.matches) {
      prepareFinalFrame();
      video.pause();
    } else {
      attemptPlayback();
    }
  };

  video.addEventListener("loadeddata", handleLoadedData);
  video.addEventListener("canplay", attemptPlayback);
  video.addEventListener("playing", handlePlaying);
  video.addEventListener("pause", handlePause);
  video.addEventListener("ended", handleEnded);
  document.addEventListener("visibilitychange", attemptPlayback);
  window.addEventListener("pageshow", attemptPlayback);
  reducedMotion.addEventListener("change", handleMotionChange);

  if (video.readyState >= 2) handleLoadedData();
  if (video.ended) handleEnded();
  if (reducedMotion.matches) prepareFinalFrame();

  if (!lifecycle.hasEnded && "IntersectionObserver" in window) {
    loadObserver = new window.IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      prepareFinalFrame();
      if (!reducedMotion.matches) prepareVideo();
      loadObserver.disconnect();
    }, { rootMargin: "120% 0px", threshold: 0 });
    playbackObserver = new window.IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
      attemptPlayback();
    }, { threshold: [0, 0.18] });
    loadObserver.observe(root);
    playbackObserver.observe(root);
  } else if (!lifecycle.hasEnded) {
    const checkVisibility = () => {
      const bounds = root.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 2) {
        prepareFinalFrame();
        if (!reducedMotion.matches) prepareVideo();
      }
      isVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
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
    loadObserver?.disconnect();
    playbackObserver?.disconnect();
    fallbackVisibilityCleanup?.();
    gestureRetryCleanup?.();
    video.removeEventListener("loadeddata", handleLoadedData);
    video.removeEventListener("canplay", attemptPlayback);
    video.removeEventListener("playing", handlePlaying);
    video.removeEventListener("pause", handlePause);
    video.removeEventListener("ended", handleEnded);
    document.removeEventListener("visibilitychange", attemptPlayback);
    window.removeEventListener("pageshow", attemptPlayback);
    reducedMotion.removeEventListener("change", handleMotionChange);
  };
}
