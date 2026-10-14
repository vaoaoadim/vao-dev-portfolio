import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./beautyBombLoading.css";

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
  const lastActivity = useRef(0);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState({ status: "loading", progress: null, delayed: false });
  const gameUrl = useMemo(() => {
    const url = new URL(
      import.meta.env.VITE_BEAUTYBOMB_GAME_URL || DEFAULT_GAME_URL,
    );
    url.searchParams.set("embed", "portfolio");
    // Request the game version with an inline shell and independent startup.
    url.searchParams.set("embedVersion", "4");
    return url;
  }, []);

  useEffect(() => {
    setLoading({ status: "loading", progress: null, delayed: false });
    if (!open) return undefined;
    lastActivity.current = Date.now();
    const timer = window.setInterval(() => {
      if (Date.now() - lastActivity.current < 30000) return;
      setLoading((current) => current.status === "loading" && !current.delayed
        ? { ...current, delayed: true }
        : current);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [open, attempt]);

  useEffect(() => {
    if (!open || loading.status === "ready") return undefined;
    const resumeLoading = () => {
      setLoading({ status: "loading", progress: null, delayed: false });
      setAttempt((value) => value + 1);
    };
    window.addEventListener("online", resumeLoading);
    return () => window.removeEventListener("online", resumeLoading);
  }, [open, loading.status]);

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
        event.data?.source !== "beautybomb-delivery" ||
        event.data?.version !== 1
      ) {
        return;
      }

      if (isCloseRequest(event.data)) {
        onClose();
      } else if (event.data.type === "ready") {
        setLoading({ status: "ready", progress: 1, delayed: false });
        iframeRef.current?.focus();
        postGameActiveState(document.visibilityState === "visible");
      } else if (event.data.type === "progress" && Number.isFinite(event.data.progress)) {
        lastActivity.current = Date.now();
        setLoading((current) => current.status === "ready" ? current : {
          ...current,
          progress: Math.min(1, Math.max(0, event.data.progress)),
          delayed: false,
        });
      } else if (event.data.type === "error") {
        setLoading((current) => ({ ...current, status: "error" }));
      }
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
    document.querySelector(".beautybomb-game-popup__close")?.focus();
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

  const frameUrl = new URL(gameUrl);
  if (attempt) frameUrl.searchParams.set("retry", String(attempt));
  const retry = () => {
    setLoading({ status: "loading", progress: null, delayed: false });
    setAttempt((value) => value + 1);
  };

  return createPortal(
    <div
      className="beautybomb-game-popup"
      role="dialog"
      aria-modal="true"
      aria-label="BeautyBomb Delivery"
      aria-busy={loading.status === "loading"}
      data-game-status={loading.status}
    >
      {closeLabel && <button className="beautybomb-game-popup__close" type="button" aria-label={closeLabel} onClick={onClose}>×</button>}
      <div className="beautybomb-game-popup__surface">
        <div className="beautybomb-game-loading" hidden={loading.status === "ready"}>
          <div className="beautybomb-game-loading__frame">
            <section className="beautybomb-game-loading__content" aria-live="polite">
              {loading.status === "error" ? <p className="beautybomb-game-loading__copy">Не удалось загрузить игру</p> : <>
                <p className="beautybomb-game-loading__copy">
                  <span>Курьер забирает товар</span><span className="beautybomb-game-loading__dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>
                </p>
                <div className={`beautybomb-game-loading__progress${loading.progress === null ? " beautybomb-game-loading__progress--indeterminate" : ""}`}
                  role="progressbar" aria-label="Загрузка игры" aria-valuemin={0} aria-valuemax={100}
                  aria-valuenow={loading.progress === null ? undefined : Math.round(loading.progress * 100)}
                  style={{ "--game-loading-progress": `${(loading.progress ?? 0) * 100}%` }}><span /></div>
              </>}
              {loading.delayed && loading.status === "loading" && <p className="beautybomb-game-loading__hint">Загрузка занимает больше времени.</p>}
              {(loading.status === "error" || loading.delayed) && <button type="button" className="beautybomb-game-loading__retry" onClick={retry}>Повторить загрузку</button>}
            </section>
          </div>
        </div>
        <iframe
        key={attempt}
        ref={iframeRef}
        className="beautybomb-game-popup__frame"
        src={frameUrl.href}
        title="BeautyBomb Delivery — интерактивная промо-мини-игра"
        allow="autoplay; clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleLoad}
        style={{ visibility: loading.status === "ready" ? "visible" : "hidden" }}
      />
      </div>
    </div>,
    document.body,
  );
}
