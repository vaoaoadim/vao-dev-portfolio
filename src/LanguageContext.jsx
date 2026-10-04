import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { copy } from "./content.js";

const STORAGE_KEY = "portfolio-language";
const SUPPORTED_LANGUAGES = new Set(["ru", "en"]);
const ENGLISH_COUNTRIES = new Set(["US", "GB", "CA", "AU", "NZ", "IE"]);
const LanguageContext = createContext(null);

function normalizeLanguage(value) {
  return SUPPORTED_LANGUAGES.has(value) ? value : null;
}

function readSavedLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function getBrowserLanguage() {
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  return languages.some((language) => language?.toLowerCase().startsWith("ru"))
    ? "ru"
    : "en";
}

function languageForCountry(country) {
  if (country === "RU") return "ru";
  if (ENGLISH_COUNTRIES.has(country)) return "en";
  return null;
}

function interpolate(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

export function LanguageProvider({ children }) {
  const savedLanguage = readSavedLanguage();
  const bootstrapLanguage =
    normalizeLanguage(document.documentElement.dataset.language) ??
    savedLanguage ??
    getBrowserLanguage();
  const [language, setLanguage] = useState(bootstrapLanguage);
  // The inline bootstrap in index.html already selects a safe browser-language
  // fallback. Keeping the application visible prevents locale detection from
  // holding the entire first screen behind a network request.
  const [isReady, setIsReady] = useState(true);

  const selectLanguage = useCallback((nextLanguage) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage);
    if (!normalizedLanguage) return;

    setLanguage(normalizedLanguage);
    setIsReady(true);

    try {
      window.localStorage.setItem(STORAGE_KEY, normalizedLanguage);
    } catch {
      // Language switching still works for this session when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (savedLanguage || import.meta.env.DEV || import.meta.env.VITE_STATIC_HOST) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 900);
    let isCurrent = true;

    const resolveInitialLanguage = async () => {
      let nextLanguage = getBrowserLanguage();

      try {
        const response = await fetch("/api/locale", {
          headers: { accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.ok) {
          const payload = await response.json();
          nextLanguage =
            languageForCountry(String(payload.country ?? "").toUpperCase()) ??
            nextLanguage;
        }
      } catch {
        // Browser language is the silent fallback for unavailable geolocation.
      } finally {
        window.clearTimeout(timeoutId);
        if (isCurrent) {
          setLanguage(nextLanguage);
        }
      }
    };

    resolveInitialLanguage();

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [savedLanguage]);

  useLayoutEffect(() => {
    const currentCopy = copy[language];
    const root = document.documentElement;
    const description = document.querySelector('meta[name="description"]');

    root.lang = language;
    root.dataset.language = language;
    root.dataset.languageReady = String(isReady);
    document.title = currentCopy.meta.title;
    description?.setAttribute("content", currentCopy.meta.description);
  }, [isReady, language]);

  const value = useMemo(
    () => ({
      language,
      copy: copy[language],
      selectLanguage,
      interpolate,
    }),
    [language, selectLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
