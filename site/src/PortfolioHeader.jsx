import { useCallback, useEffect, useRef, useState } from "react";
import { PortfolioMenu } from "./PortfolioMenu";

export function PortfolioHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const brandRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const shouldRestoreScrollRef = useRef(true);
  const lockedScrollPositionRef = useRef({ x: 0, y: 0 });
  const pendingNavigationScrollRef = useRef(null);
  const navigationTimerRef = useRef(0);

  const closeMenu = useCallback(() => {
    window.clearTimeout(navigationTimerRef.current);
    setIsMenuOpen(false);

    window.requestAnimationFrame(() => {
      menuTriggerRef.current?.focus();
    });
  }, []);

  const openMenu = useCallback(() => {
    shouldRestoreScrollRef.current = true;
    pendingNavigationScrollRef.current = null;
    setIsMenuOpen(true);
  }, []);

  const navigateToSection = useCallback(
    (targetId) => {
      const target = document.getElementById(targetId);
      if (!target) return;

      shouldRestoreScrollRef.current = false;
      pendingNavigationScrollRef.current =
        target.getBoundingClientRect().top + lockedScrollPositionRef.current.y;
      navigationTimerRef.current = window.setTimeout(closeMenu, 110);
    },
    [closeMenu],
  );

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const root = document.documentElement;
    const body = document.body;
    const scene = document.querySelector(".mascot-scroll-scene");
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyRight = body.style.right;
    const previousBodyLeft = body.style.left;
    const previousBodyWidth = body.style.width;
    const previousSceneInert = scene?.getAttribute("inert");
    const previousSceneAriaHidden = scene?.getAttribute("aria-hidden");

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.right = "0";
    body.style.left = `${-scrollX}px`;
    body.style.width = "100%";
    lockedScrollPositionRef.current = { x: scrollX, y: scrollY };

    if (scene) {
      scene.inert = true;
      scene.setAttribute("inert", "");
      scene.setAttribute("aria-hidden", "true");
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.right = previousBodyRight;
      body.style.left = previousBodyLeft;
      body.style.width = previousBodyWidth;

      if (scene) {
        scene.inert = previousSceneInert !== null;
        if (previousSceneInert === null) scene.removeAttribute("inert");
        else scene.setAttribute("inert", previousSceneInert);
        if (previousSceneAriaHidden === null) scene.removeAttribute("aria-hidden");
        else scene.setAttribute("aria-hidden", previousSceneAriaHidden);
      }

      const destinationY = shouldRestoreScrollRef.current
        ? scrollY
        : pendingNavigationScrollRef.current ?? scrollY;
      window.requestAnimationFrame(() => window.scrollTo(scrollX, destinationY));

      shouldRestoreScrollRef.current = true;
      pendingNavigationScrollRef.current = null;
    };
  }, [isMenuOpen]);

  useEffect(
    () => () => window.clearTimeout(navigationTimerRef.current),
    [],
  );

  return (
    <>
      <header className={`portfolio-header ${isMenuOpen ? "is-menu-open" : ""}`}>
        <a
          ref={brandRef}
          className="portfolio-brand"
          href="#top"
          aria-label="v.build — back to top"
        >
          v.build
        </a>
        <button
          ref={menuTriggerRef}
          className="portfolio-menu-label"
          type="button"
          onClick={isMenuOpen ? closeMenu : openMenu}
          aria-expanded={isMenuOpen}
          aria-controls="portfolio-menu"
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMenuOpen ? "close" : "menu"}
        </button>
      </header>

      <PortfolioMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onNavigate={navigateToSection}
        brandRef={brandRef}
        triggerRef={menuTriggerRef}
      />
    </>
  );
}
