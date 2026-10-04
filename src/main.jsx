import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/onest/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import { App } from "./App.jsx";
import { LanguageProvider } from "./LanguageContext.jsx";
import "./styles.css";
import { SITE_BASE, sitePath } from "./sitePath";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(sitePath("/selected-works-mascot-sw.js"), { scope: SITE_BASE })
      .catch(() => {});
  }, { once: true });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);
