import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

const DEFAULT_GAME_URL = "https://beautybomb-delivery.vercel.app";

function isCloseRequest(message) {
  return (
    message?.source === "beautybomb-delivery" &&
    message?.version === 1 &&
    message?.type === "request-close"
  );
}

export function BeautyBombGamePopup({ open, onClose, triggerRef, closeLabel }) {
  const iframeRef = useRef(null);
  const gameUrl = useMemo(() => {
    const url = new URL(
      import.meta.env.VITE_BEAUTYBOMB_GAME_URL || DEFAULT_GAME_URL,
    );
    url.searchParams.set("embed", "portfolio");
    // Bypass cached game HTML that selected its frame only after loading Phaser.
    url.searchParams.set("embedVersion", "3");
    return url;
  }, []);

  useEffect(() => {
    const trigger = triggerRef?.current;

    if (!trigger) return undefined;

    let connectionLink = null;
    let observer = null;

    const warmConnection = () => {
      if (connectionLink) return;

      connectionLink = document.createElement("link");
      connectionLink.rel = "preconnect";
      connectionLink.href = gameUrl.origin;
      connectionLink.crossOrigin = "anonymous";
      document.head.append(connectionLink);
      observer?.disconnect();
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) warmConnection();
        },
        { rootMargin: "120%" },
      );
      observer.observe(trigger);
    } else {
      warmConnection();
    }

    return () => {
      observer?.disconnect();
      connectionLink?.remove();
    };
  }, [gameUrl.origin, triggerRef]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const background = document.querySelector("main.portfolio");
    const previousInert = background?.inert;
    if (background) background.inert = true;

    document.documentElement.classList.add("has-beautybomb-game-open");
    window.dispatchEvent(new Event("portfolio:hide-cursor"));

    const postGameActiveState = (active) => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          source: "portfolio-host",
          version: 1,
          type: "set-game-active",
          active,
        },
        gameUrl.origin,
      );
    };

    const handleMessage = (event) => {
      if (
        event.origin !== gameUrl.origin ||
        event.source !== iframeRef.current?.contentWindow ||
        !isCloseRequest(event.data)
      ) {
        return;
      }

      onClose();
    };

    const handleVisibilityChange = () => {
      postGameActiveState(document.visibilityState === "visible");
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      postGameActiveState(false);
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("has-beautybomb-game-open");
      if (background) background.inert = previousInert;

      const focusTarget = triggerRef?.current || previousFocus;
      window.requestAnimationFrame(() => focusTarget?.focus?.({ preventScroll: true }));
    };
  }, [gameUrl, onClose, open, triggerRef]);

  if (!open) return null;

  const handleLoad = () => {
    iframeRef.current?.focus();
    iframeRef.current?.contentWindow?.postMessage(
      {
        source: "portfolio-host",
        version: 1,
        type: "set-game-active",
        active: document.visibilityState === "visible",
      },
      gameUrl.origin,
    );
  };

  return createPortal(
    <div
      className="beautybomb-game-popup"
      role="dialog"
      aria-modal="true"
      aria-label="BeautyBomb Delivery"
    >
      {closeLabel && <button className="beautybomb-game-popup__close" type="button" aria-label={closeLabel} onClick={onClose}>×</button>}
      <iframe
        ref={iframeRef}
        className="beautybomb-game-popup__frame"
        src={gameUrl.href}
        title="BeautyBomb Delivery — интерактивная промо-мини-игра"
        allow="autoplay; clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleLoad}
      />
    </div>,
    document.body,
  );
}
