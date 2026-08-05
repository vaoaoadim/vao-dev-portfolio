import { useEffect, useRef, useState } from "react";
import {
  GithubLogoIcon,
  InstagramLogoIcon,
  TelegramLogoIcon,
  ThreadsLogoIcon,
} from "@phosphor-icons/react";
import { BuildMark3D } from "./BuildMark3D";
import { PortfolioHeader } from "./PortfolioHeader";
const THEME_KEY = "vao.theme";
const THEMES = new Set(["light", "dark"]);

function SunOutlineIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.2v2.1M12 19.7v2.1M4.95 4.95l1.48 1.48M17.57 17.57l1.48 1.48M2.2 12h2.1M19.7 12h2.1M4.95 19.05l1.48-1.48M17.57 6.43l1.48-1.48" />
    </svg>
  );
}

function MoonOutlineIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19.35 14.45A7.55 7.55 0 0 1 9.55 4.65 7.55 7.55 0 1 0 19.35 14.45Z" />
    </svg>
  );
}

const socialPlaceholders = [
  ["GitHub", GithubLogoIcon],
  ["Instagram", InstagramLogoIcon],
  ["Threads", ThreadsLogoIcon],
  ["Telegram", TelegramLogoIcon],
];

function SocialPlaceholders({ theme }) {
  return (
    <div
      className="social-placeholders"
      data-theme={theme}
      aria-label="Social links coming soon"
    >
      {socialPlaceholders.map(([name, Icon]) => (
        <button
          key={name}
          className="social-placeholder"
          type="button"
          disabled
          aria-label={`${name} link coming soon`}
          title={`${name} — coming soon`}
        >
          <Icon weight="regular" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function readInitialTheme() {
  const documentTheme = document.documentElement.dataset.theme;
  if (THEMES.has(documentTheme)) return documentTheme;

  try {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (THEMES.has(savedTheme)) return savedTheme;
  } catch {
    // Local storage is an enhancement; the light scene remains the fallback.
  }

  return "light";
}

function afterPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });
}

function ScenePicture({ theme, active, imageRef }) {
  const portrait = `/assets/office-${theme}-portrait`;
  const landscape = `/assets/office-${theme}-landscape`;

  return (
    <picture
      className="theme-scene"
      data-theme={theme}
      data-active={active ? "true" : "false"}
      aria-hidden="true"
    >
      <source
        media="(orientation: portrait)"
        srcSet={`${portrait}.avif`}
        type="image/avif"
        width="941"
        height="1672"
      />
      <source
        srcSet={`${landscape}.avif`}
        type="image/avif"
        width="1672"
        height="941"
      />
      <source
        media="(orientation: portrait)"
        srcSet={`${portrait}.webp`}
        type="image/webp"
        width="941"
        height="1672"
      />
      <source
        srcSet={`${landscape}.webp`}
        type="image/webp"
        width="1672"
        height="941"
      />
      <source
        media="(orientation: portrait)"
        srcSet={`${portrait}.png`}
        type="image/png"
        width="941"
        height="1672"
      />
      <img
        ref={imageRef}
        src={`${landscape}.png`}
        alt=""
        width="1672"
        height="941"
        loading={active ? "eager" : "lazy"}
        fetchPriority={active ? "high" : "low"}
        decoding="async"
        draggable="false"
      />
    </picture>
  );
}

export function App() {
  const [theme, setTheme] = useState(readInitialTheme);
  const [darkMounted, setDarkMounted] = useState(theme === "dark");
  const [switching, setSwitching] = useState(false);
  const switchingRef = useRef(false);
  const lightImageRef = useRef(null);
  const darkImageRef = useRef(null);

  useEffect(() => {
    if (darkMounted) return undefined;

    const mountDarkScene = () => setDarkMounted(true);
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(mountDarkScene, { timeout: 1400 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(mountDarkScene, 400);
    return () => window.clearTimeout(timeoutId);
  }, [darkMounted]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute(
      "content",
      theme === "light" ? "#fcfcfc" : "#181c27",
    );
  }, [theme]);

  const toggleTheme = async () => {
    if (switchingRef.current) return;

    const nextTheme = theme === "light" ? "dark" : "light";
    switchingRef.current = true;
    setSwitching(true);

    try {
      if (nextTheme === "dark" && !darkMounted) {
        setDarkMounted(true);
        await afterPaint();
      }

      const nextImage =
        nextTheme === "dark" ? darkImageRef.current : lightImageRef.current;

      try {
        await nextImage?.decode?.();
      } catch {
        // Keep the current frame until the browser can paint the selected source.
      }

      setTheme(nextTheme);

      try {
        window.localStorage.setItem(THEME_KEY, nextTheme);
      } catch {
        // The session still switches correctly when storage is unavailable.
      }
    } finally {
      switchingRef.current = false;
      setSwitching(false);
    }
  };

  const isLight = theme === "light";
  const actionLabel = isLight
    ? "Turn on dark theme"
    : "Turn on light theme";

  return (
    <main className="theme-stage" aria-label="vao.dev portfolio preview">
      <ScenePicture
        theme="light"
        active={isLight}
        imageRef={lightImageRef}
      />

      {darkMounted && (
        <ScenePicture
          theme="dark"
          active={!isLight}
          imageRef={darkImageRef}
        />
      )}

      <BuildMark3D theme={theme} />
      <SocialPlaceholders theme={theme} />
      <PortfolioHeader theme={theme} />

      <button
        className="theme-toggle"
        type="button"
        data-theme={theme}
        aria-label={actionLabel}
        aria-pressed={!isLight}
        aria-busy={switching}
        aria-disabled={switching}
        title={actionLabel}
        onClick={toggleTheme}
      >
        <span className="theme-icon-stack" aria-hidden="true">
          <SunOutlineIcon className="theme-icon theme-icon-sun" />
          <MoonOutlineIcon className="theme-icon theme-icon-moon" />
        </span>
      </button>
    </main>
  );
}
