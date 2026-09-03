import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_GAME_URL = "https://beautybomb-delivery.vercel.app";
const LOAD_TIMEOUT_MS = 20000;
const LOADER_EXIT_MS = 220;

function isCloseRequest(message) {
  return (
    message?.source === "beautybomb-delivery" &&
    message?.version === 1 &&
    message?.type === "request-close"
  );
}

function getGameLifecycleMessage(message) {
  if (
    message?.source !== "beautybomb-delivery" ||
    message?.version !== 1
  ) {
    return null;
  }

  if (
    message.type === "progress" &&
    typeof message.progress === "number" &&
    Number.isFinite(message.progress)
  ) {
    return {
      type: "progress",
      progress: Math.min(1, Math.max(0, message.progress)),
    };
  }

  if (message.type === "ready") {
    return { type: "ready" };
  }

  if (
    message.type === "error" &&
    (message.reason === "preload" || message.reason === "startup")
  ) {
    return { type: "error" };
  }

  return null;
}

export function BeautyBombGamePopup({ open, onClose, triggerRef }) {
  const iframeRef = useRef(null);
  const [frameSource, setFrameSource] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [progress, setProgress] = useState(null);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [retryNonce, setRetryNonce] = useState(0);
  const gameUrl = useMemo(() => {
    const url = new URL(
      import.meta.env.VITE_BEAUTYBOMB_GAME_URL || DEFAULT_GAME_URL,
    );
    url.searchParams.set("embed", "portfolio");
    return url;
  }, []);

  useEffect(() => {
    if (!open) {
      setFrameSource(null);
      setLoadState("loading");
      setProgress(null);
      setLoaderVisible(true);
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

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
      if (event.origin !== gameUrl.origin || event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      if (isCloseRequest(event.data)) {
        onClose();
        return;
      }

      const lifecycleMessage = getGameLifecycleMessage(event.data);
      if (!lifecycleMessage) {
        return;
      }

      if (lifecycleMessage.type === "progress") {
        setProgress(lifecycleMessage.progress);
        return;
      }

      if (lifecycleMessage.type === "error") {
        setLoadState("error");
        return;
      }

      setProgress(1);
      setLoadState("ready");
    };

    const handleVisibilityChange = () => {
      postGameActiveState(document.visibilityState === "visible");
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("message", handleMessage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    setFrameSource(() => {
      const url = new URL(gameUrl);
      url.searchParams.set("embed-attempt", String(retryNonce));
      return url.href;
    });

    return () => {
      postGameActiveState(false);
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.body.style.overflow = previousOverflow;

      const focusTarget = triggerRef?.current || previousFocus;
      window.requestAnimationFrame(() => focusTarget?.focus?.());
    };
  }, [gameUrl, onClose, open, retryNonce, triggerRef]);

  useEffect(() => {
    if (!open || loadState !== "loading") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setLoadState("error");
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [loadState, open, retryNonce]);

  useEffect(() => {
    if (!open || loadState !== "ready") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setLoaderVisible(false);
    }, LOADER_EXIT_MS);

    return () => window.clearTimeout(timeout);
  }, [loadState, open]);

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

  const retryGame = () => {
    setFrameSource(null);
    setProgress(null);
    setLoadState("loading");
    setLoaderVisible(true);
    setRetryNonce((value) => value + 1);
  };

  const isError = loadState === "error";
  const showLoader = loaderVisible || isError;

  return createPortal(
    <div
      className="beautybomb-game-popup"
      role="dialog"
      aria-modal="true"
      aria-label="BeautyBomb Delivery"
    >
      {frameSource ? (
        <iframe
          ref={iframeRef}
          className="beautybomb-game-popup__frame"
          src={frameSource}
          title="BeautyBomb Delivery — интерактивная промо-мини-игра"
          allow="autoplay; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin"
          onLoad={handleLoad}
        />
      ) : (
        <div className="beautybomb-game-popup__frame" aria-hidden="true" />
      )}
      <div
        className={[
          "beautybomb-game-popup__loader",
          showLoader ? "" : "beautybomb-game-popup__loader--hidden",
          isError ? "beautybomb-game-popup__loader--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-busy={!isError && showLoader}
        aria-live="polite"
      >
        {isError ? (
          <div className="beautybomb-game-popup__loader-error">
            <p>Не удалось загрузить игру</p>
            <button type="button" onClick={retryGame}>
              Повторить
            </button>
          </div>
        ) : (
          <>
            <p className="beautybomb-game-popup__loader-copy">
              <span aria-hidden="true">Курьер забирает товар</span>
              <span
                className="beautybomb-game-popup__loader-dots"
                aria-hidden="true"
              >
                <i>.</i>
                <i>.</i>
                <i>.</i>
              </span>
              <span className="beautybomb-game-popup__sr-only">
                Курьер забирает товар…
              </span>
            </p>
            <div
              className={[
                "beautybomb-game-popup__loader-progress",
                progress === null
                  ? "beautybomb-game-popup__loader-progress--indeterminate"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="progressbar"
              aria-label="Загрузка игры"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                progress === null ? undefined : Math.round(progress * 100)
              }
              style={
                progress === null
                  ? undefined
                  : { "--beautybomb-progress": `${progress * 100}%` }
              }
            >
              <span />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
