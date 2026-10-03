import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePortfolioRoute } from "./PortfolioRouteContext";
import { isCasePath } from "./caseStudyRoutes";

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
  const { route, goHome } = usePortfolioRoute();
  const previousPath = useRef(route.path);
  const pendingSectionRef = useRef(null);
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
    window.history.pushState(window.history.state, "", url);
  }, []);

  const clearContactHash = useCallback(() => {
    if (window.location.hash !== "#contacts") return;

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  const openMenu = useCallback((origin) => {
    clearContactHash();
    originRef.current = origin ?? menuTriggerRef.current;
    pendingNavigationRef.current = null;
    returnToMenuRef.current = false;
    menuUnderlayRef.current = true;
    setMenuUnderlayActive(true);
    setIsClosing(false);
    setActiveOverlay("menu");
  }, [clearContactHash]);

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
    if (isCasePath(route.path)) {
      if (!activeOverlay) goHome(targetId);
      else {
        pendingSectionRef.current = targetId;
        setIsClosing(true);
      }
      return;
    }
    const target = document.getElementById(targetId);
    if (!target) return;

    clearContactHash();
    if (!activeOverlay) {
      target.scrollIntoView({ block: "start" });
      return;
    }

    originRef.current = origin ?? menuTriggerRef.current;
    pendingNavigationRef.current =
      target.getBoundingClientRect().top + lockedScrollPositionRef.current.y;
    setIsClosing(true);
  }, [activeOverlay, clearContactHash, route.path, goHome]);

  const requestClose = useCallback(() => {
    if (!activeOverlay || isClosing) return;
    setIsClosing(true);
  }, [activeOverlay, isClosing]);

  const completeClose = useCallback(() => {
    const focusTarget = originRef.current ?? menuTriggerRef.current;
    const hadInfoOverlay = INFO_OVERLAYS.has(activeOverlay);
    const hasPendingNavigation = pendingNavigationRef.current !== null || pendingSectionRef.current !== null;

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
      window.requestAnimationFrame(() => focusTarget?.focus({ preventScroll: true }));
    }
  }, [activeOverlay, writeHash]);

  // A browser history transition must not keep the previous page's scroll lock.
  useLayoutEffect(() => {
    if (previousPath.current === route.path) return;
    previousPath.current = route.path;
    setActiveOverlay(null);
    setIsClosing(false);
    setMenuUnderlayActive(false);
    menuUnderlayRef.current = false;
    returnToMenuRef.current = false;
  }, [route.path]);

  useEffect(() => {
    if (!isOverlayOpen) return undefined;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const lockedPath = window.location.pathname;
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
      const targetSection = pendingSectionRef.current;
      pendingSectionRef.current = null;
      window.requestAnimationFrame(() => {
        if (targetSection) goHome(targetSection);
        else if (window.location.pathname === lockedPath) window.scrollTo(scrollX, destinationY);
      });
    };
  }, [isOverlayOpen, goHome]);

  useEffect(() => {
    const target = document.getElementById("contacts");
    if (!target) return undefined;

    let hasReachedContact = false;
    let initialFrame = 0;
    let settledFrame = 0;
    const isContactVisible = () => {
      const bounds = target.getBoundingClientRect();
      return bounds.top < window.innerHeight && bounds.bottom > 0;
    };
    const handleScroll = () => {
      if (window.location.hash !== "#contacts") {
        hasReachedContact = false;
        return;
      }

      if (isContactVisible()) {
        hasReachedContact = true;
        return;
      }

      if (hasReachedContact) clearContactHash();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (window.location.hash === "#contacts") {
      initialFrame = window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start" });
        settledFrame = window.requestAnimationFrame(handleScroll);
      });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(settledFrame);
    };
  }, [clearContactHash]);

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
