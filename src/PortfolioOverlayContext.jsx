import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const INFO_OVERLAYS = new Set([
  "about",
  "stack",
  "privacy-policy",
  "public-offer",
]);

const OverlayContext = createContext(null);

function getHashOverlay() {
  const hash = window.location.hash.slice(1);
  return INFO_OVERLAYS.has(hash) ? hash : null;
}

export function PortfolioOverlayProvider({ children }) {
  const [activeOverlay, setActiveOverlay] = useState(getHashOverlay);
  const [isClosing, setIsClosing] = useState(false);
  const [menuUnderlayActive, setMenuUnderlayActive] = useState(false);
  const brandRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const menuUnderlayRef = useRef(false);
  const returnToMenuRef = useRef(false);
  const originRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const lockedScrollPositionRef = useRef({ x: 0, y: 0 });

  const isOverlayOpen = activeOverlay !== null;

  const writeHash = useCallback((hash) => {
    const url = hash
      ? `${window.location.pathname}${window.location.search}#${hash}`
      : `${window.location.pathname}${window.location.search}`;
    window.history.pushState(null, "", url);
  }, []);

  const openMenu = useCallback((origin) => {
    originRef.current = origin ?? menuTriggerRef.current;
    pendingNavigationRef.current = null;
    returnToMenuRef.current = false;
    menuUnderlayRef.current = true;
    setMenuUnderlayActive(true);
    setIsClosing(false);
    setActiveOverlay("menu");
  }, []);

  const openInfo = useCallback(
    (overlay, origin) => {
      if (!INFO_OVERLAYS.has(overlay)) return;
      originRef.current = origin ?? menuTriggerRef.current;
      pendingNavigationRef.current = null;
      returnToMenuRef.current = activeOverlay === "menu";
      setIsClosing(false);
      setActiveOverlay(overlay);
      writeHash(overlay);
    },
    [activeOverlay, writeHash],
  );

  const navigateToSection = useCallback((targetId, origin) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    originRef.current = origin ?? menuTriggerRef.current;
    pendingNavigationRef.current =
      target.getBoundingClientRect().top + lockedScrollPositionRef.current.y;
    writeHash(targetId);
    setIsClosing(true);
  }, [writeHash]);

  const requestClose = useCallback(() => {
    if (!activeOverlay || isClosing) return;
    setIsClosing(true);
  }, [activeOverlay, isClosing]);

  const completeClose = useCallback(() => {
    const focusTarget = originRef.current ?? menuTriggerRef.current;
    const hadInfoOverlay = INFO_OVERLAYS.has(activeOverlay);
    const hasPendingNavigation = pendingNavigationRef.current !== null;

    if (hadInfoOverlay && returnToMenuRef.current && !hasPendingNavigation) {
      returnToMenuRef.current = false;
      setIsClosing(false);
      setActiveOverlay("menu");
      writeHash("");
      return;
    }

    setActiveOverlay(null);
    setIsClosing(false);
    returnToMenuRef.current = false;
    menuUnderlayRef.current = false;
    setMenuUnderlayActive(false);
    originRef.current = null;
    if (hadInfoOverlay) writeHash("");

    if (!hasPendingNavigation) {
      window.requestAnimationFrame(() => focusTarget?.focus());
    }
  }, [activeOverlay, writeHash]);

  useEffect(() => {
    if (!isOverlayOpen) return undefined;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const root = document.documentElement;
    const body = document.body;
    const content = document.querySelector(".portfolio-content");
    const previous = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyRight: body.style.right,
      bodyLeft: body.style.left,
      bodyWidth: body.style.width,
      contentInert: content?.getAttribute("inert"),
      contentAriaHidden: content?.getAttribute("aria-hidden"),
    };

    lockedScrollPositionRef.current = { x: scrollX, y: scrollY };
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.right = "0";
    body.style.left = `${-scrollX}px`;
    body.style.width = "100%";

    if (content) {
      content.inert = true;
      content.setAttribute("inert", "");
      content.setAttribute("aria-hidden", "true");
    }

    return () => {
      root.style.overflow = previous.rootOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.right = previous.bodyRight;
      body.style.left = previous.bodyLeft;
      body.style.width = previous.bodyWidth;

      if (content) {
        content.inert = previous.contentInert !== null;
        if (previous.contentInert === null) content.removeAttribute("inert");
        else content.setAttribute("inert", previous.contentInert);
        if (previous.contentAriaHidden === null) content.removeAttribute("aria-hidden");
        else content.setAttribute("aria-hidden", previous.contentAriaHidden);
      }

      const destinationY = pendingNavigationRef.current ?? scrollY;
      pendingNavigationRef.current = null;
      window.requestAnimationFrame(() => window.scrollTo(scrollX, destinationY));
    };
  }, [isOverlayOpen]);

  useEffect(() => {
    const syncHash = () => {
      const overlay = getHashOverlay();
      if (overlay) {
        setIsClosing(false);
        setActiveOverlay(overlay);
        return;
      }

      if (window.location.hash === "#contacts") {
        const target = document.getElementById("contacts");
        if (activeOverlay && target) {
          pendingNavigationRef.current =
            target.getBoundingClientRect().top + lockedScrollPositionRef.current.y;
          setIsClosing(true);
        } else {
          target?.scrollIntoView({ block: "start" });
        }
        return;
      }

      if (activeOverlay && !isClosing) {
        setIsClosing(true);
      }
    };

    window.addEventListener("popstate", syncHash);
    window.addEventListener("hashchange", syncHash);
    if (window.location.hash === "#contacts") {
      window.requestAnimationFrame(() => document.getElementById("contacts")?.scrollIntoView());
    }

    return () => {
      window.removeEventListener("popstate", syncHash);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [activeOverlay, isClosing]);

  return (
    <OverlayContext.Provider
      value={{
        activeOverlay,
        isClosing,
        menuUnderlayActive,
        brandRef,
        menuTriggerRef,
        openMenu,
        openInfo,
        navigateToSection,
        requestClose,
        completeClose,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

export function usePortfolioOverlay() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("usePortfolioOverlay must be used inside PortfolioOverlayProvider");
  }

  return context;
}

export function isInfoOverlay(overlay) {
  return INFO_OVERLAYS.has(overlay);
}
