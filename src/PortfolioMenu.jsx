import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLanguage } from "./LanguageContext";

const MENU_ITEMS = [
  { id: "work", targetId: "work", accent: "green" },
  { id: "services", targetId: "build", accent: "yellow" },
  { id: "about", overlay: "about", accent: "red" },
  { id: "stack", overlay: "stack", accent: "orange" },
];

const AUXILIARY_LINKS = [
  { id: "privacy-policy", labelKey: "privacy", overlay: "privacy-policy" },
  { id: "public-offer", labelKey: "offer", overlay: "public-offer" },
  { id: "contacts", labelKey: "contacts", targetId: "contacts" },
];

function getFocusableElements(menu, brand, trigger) {
  if (!menu) return [];

  return [
    brand,
    trigger,
    ...menu.querySelectorAll('button:not([disabled]), a[href]'),
  ].filter(
    (element, index, all) =>
      element &&
      all.indexOf(element) === index &&
      element.getClientRects().length > 0 &&
      !element.hasAttribute("disabled"),
  );
}

export function PortfolioMenu({
  isOpen,
  isInteractive,
  isClosing,
  onClose,
  onClosed,
  onNavigate,
  onOpenInfo,
  brandRef,
  triggerRef,
}) {
  const { copy, interpolate } = useLanguage();
  const menuRef = useRef(null);
  const hasOpenedRef = useRef(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return undefined;

      const itemLabels = menu.querySelectorAll(".portfolio-menu__item-inner");
      const supportingContent = menu.querySelectorAll(".portfolio-menu__footer");

      gsap.killTweensOf([menu, itemLabels, supportingContent]);

      if (isOpen && !isClosing && hasOpenedRef.current) {
        gsap.set(menu, {
          autoAlpha: 1,
          pointerEvents: isInteractive ? "auto" : "none",
          scaleY: 1,
        });
        return undefined;
      }

      if (isOpen && !isClosing) {
        hasOpenedRef.current = true;
        setActiveItemId(null);

        gsap.set(menu, {
          autoAlpha: 1,
          pointerEvents: "auto",
          scaleY: 0,
          transformOrigin: "top center",
        });
        gsap.set(itemLabels, { yPercent: 0, y: reducedMotion ? 0 : 30, autoAlpha: 0 });
        gsap.set(supportingContent, { autoAlpha: 0, y: reducedMotion ? 0 : 8 });

        if (reducedMotion) {
          gsap.set([itemLabels, supportingContent], { y: 0, autoAlpha: 1 });
          return gsap.to(menu, {
            scaleY: 1,
            duration: 0.16,
            ease: "power1.out",
          });
        }

        return gsap
          .timeline()
          .to(menu, {
            scaleY: 1,
            duration: 0.68,
            ease: "power4.inOut",
          })
          .to(
            itemLabels,
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.48,
              stagger: 0.065,
              ease: "power3.out",
            },
            "-=0.14",
          )
          .to(
            supportingContent,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.28,
              stagger: 0.05,
              ease: "power2.out",
            },
            "-=0.18",
          );
      }

      if (!hasOpenedRef.current) {
        gsap.set(menu, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        return undefined;
      }

      if (!isClosing) {
        gsap.set(menu, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        return undefined;
      }

      gsap.set(menu, { pointerEvents: "none" });
      if (reducedMotion) {
        gsap.set(menu, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        hasOpenedRef.current = false;
        onClosed();
        return undefined;
      }

      return gsap
        .timeline()
        .to(menu, {
          scaleY: 0,
          duration: 0.62,
          ease: "power4.inOut",
        })
        .set(menu, { autoAlpha: 0, pointerEvents: "none" })
        .call(() => {
          hasOpenedRef.current = false;
          onClosed();
        });
    },
    {
      scope: menuRef,
      dependencies: [isClosing, isInteractive, isOpen, onClosed, reducedMotion],
    },
  );

  useEffect(() => {
    if (!isInteractive || isClosing) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(
        menuRef.current,
        brandRef.current,
        triggerRef.current,
      );
      if (!focusable.length) return;

      const currentIndex = focusable.indexOf(document.activeElement);
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusable.length - 1
          : currentIndex - 1
        : currentIndex === focusable.length - 1
          ? 0
          : currentIndex + 1;

      event.preventDefault();
      focusable[nextIndex].focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [brandRef, isClosing, isInteractive, onClose, reducedMotion, triggerRef]);

  const handlePrimaryItemClick = (item, origin) => {
    setActiveItemId(item.id);
    if (item.targetId) onNavigate(item.targetId, origin);
    if (item.overlay) onOpenInfo(item.overlay, origin);
  };

  const handleAuxiliaryClick = (item, origin) => {
    if (item.targetId) onNavigate(item.targetId, origin);
    if (item.overlay) onOpenInfo(item.overlay, origin);
  };

  return (
    <nav
      ref={menuRef}
      className="portfolio-menu"
      id="portfolio-menu"
      aria-label={copy.menu.label}
      aria-hidden={!isInteractive}
    >
      <div className="portfolio-menu__main">
        <ul
          className="portfolio-menu__main-list"
          data-active={activeItemId ?? undefined}
        >
          {MENU_ITEMS.map((item) => {
            const label = copy.menu.items[item.id];

            return (
            <li
              key={item.id}
              className={`portfolio-menu__main-item ${
                activeItemId === item.id ? "is-active" : ""
              }`}
            >
              <div className="portfolio-menu__item-clip">
                <button
                  className={`portfolio-menu__main-link portfolio-menu__main-link--${item.accent}`}
                  type="button"
                  onClick={(event) => handlePrimaryItemClick(item, event.currentTarget)}
                  onFocus={() => setActiveItemId(item.id)}
                  onBlur={() => setActiveItemId(null)}
                  onPointerEnter={() => setActiveItemId(item.id)}
                  onPointerLeave={() => setActiveItemId(null)}
                  onPointerDown={() => setActiveItemId(item.id)}
                  aria-label={
                    item.targetId
                      ? interpolate(copy.menu.goTo, { label })
                      : interpolate(copy.menu.open, { label })
                  }
                >
                  <span className="portfolio-menu__item-inner">
                    <span className="portfolio-menu__bracket portfolio-menu__bracket--left" aria-hidden="true">
                      [
                    </span>
                    <span>{label}</span>
                    <span className="portfolio-menu__bracket portfolio-menu__bracket--right" aria-hidden="true">
                      ]
                    </span>
                  </span>
                </button>
              </div>
            </li>
            );
          })}
        </ul>
      </div>

      <div className="portfolio-menu__footer">
        {AUXILIARY_LINKS.map((item) => (
          <button
            key={item.id}
            className="portfolio-menu__aux-link"
            type="button"
            onClick={(event) => handleAuxiliaryClick(item, event.currentTarget)}
          >
            {copy.menu.auxiliary[item.labelKey]}
          </button>
        ))}
      </div>
    </nav>
  );
}
