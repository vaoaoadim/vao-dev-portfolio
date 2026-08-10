import { useEffect, useRef } from "react";

export function MascotLayer({
  srcWebm,
  srcHevc,
  poster,
  reducedMotion = false,
  className = "",
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return undefined;

    const syncVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility();
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, [reducedMotion]);

  if (!srcWebm && !srcHevc) return null;

  if (reducedMotion) {
    return poster ? (
      <img
        className={`mascot-layer ${className}`}
        src={poster}
        alt=""
        aria-hidden="true"
        decoding="async"
      />
    ) : null;
  }

  return (
    <video
      ref={videoRef}
      className={`mascot-layer ${className}`}
      poster={poster}
      muted
      autoPlay
      loop
      playsInline
      aria-hidden="true"
      tabIndex="-1"
    >
      {srcWebm && <source src={srcWebm} type="video/webm" />}
      {srcHevc && <source src={srcHevc} type='video/mp4; codecs="hvc1"' />}
    </video>
  );
}
