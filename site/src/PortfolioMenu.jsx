import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const MENU_ITEMS = [
  { id: "work", label: "WORK", targetId: null, accent: "green" },
  { id: "services", label: "SERVICES", targetId: "build", accent: "yellow" },
  { id: "about", label: "ABOUT", targetId: null, accent: "red" },
  { id: "stack", label: "STACK", targetId: null, accent: "orange" },
];

const AUXILIARY_LINKS = ["PRIVACY POLICY", "PUBLIC OFFER", "CONTACTS"];

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
  onClose,
  onNavigate,
  brandRef,
  triggerRef,
}) {
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

      if (isOpen) {
        hasOpenedRef.current = true;
        setActiveItemId(null);
        gsap.set(menu, {
          autoAlpha: 1,
          pointerEvents: "auto",
          scaleY: 0,
          transformOrigin: "top center",
        });

        if (reducedMotion) {
          gsap.set([itemLabels, supportingContent], { yPercent: 0, autoAlpha: 1 });
          gsap.to(menu, {
            scaleY: 1,
            duration: 0.16,
            ease: "power1.out",
          });
          return undefined;
        }

        gsap.set(itemLabels, { yPercent: 110, autoAlpha: 1 });
        gsap.set(supportingContent, { autoAlpha: 0, y: 8 });

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
              yPercent: 0,
              duration: 0.48,
              stagger: 0.065,
              ease: "power4.out",
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

      if (reducedMotion) {
        gsap.set(menu, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        return undefined;
      }

      gsap.set(menu, { pointerEvents: "none" });
      return gsap
        .timeline()
        .to(menu, {
          scaleY: 0,
          duration: 0.62,
          ease: "power4.inOut",
        })
        .set(menu, { autoAlpha: 0, pointerEvents: "none" });
    },
    {
      scope: menuRef,
      dependencies: [isOpen, reducedMotion],
    },
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const focusDelay = window.setTimeout(
      () => menuRef.current?.querySelector(".portfolio-menu__main-link")?.focus(),
      reducedMotion ? 0 : 520,
    );

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
      window.clearTimeout(focusDelay);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [brandRef, isOpen, onClose, reducedMotion, triggerRef]);

  const handlePrimaryItemClick = (item) => {
    setActiveItemId(item.id);
    if (item.targetId) onNavigate(item.targetId);
  };

  return (
    <nav
      ref={menuRef}
      className="portfolio-menu"
      id="portfolio-menu"
      aria-label="Основная навигация"
      aria-hidden={!isOpen}
    >
      <div className="portfolio-menu__main">
        <ul
          className="portfolio-menu__main-list"
          data-active={activeItemId ?? undefined}
        >
          {MENU_ITEMS.map((item) => (
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
                  onClick={() => handlePrimaryItemClick(item)}
                  onFocus={() => setActiveItemId(item.id)}
                  onBlur={() => setActiveItemId(null)}
                  onPointerEnter={() => setActiveItemId(item.id)}
                  onPointerLeave={() => setActiveItemId(null)}
                  onPointerDown={() => setActiveItemId(item.id)}
                  aria-label={
                    item.targetId
                      ? `Перейти к разделу ${item.label}`
                      : `${item.label} — раздел скоро появится`
                  }
                >
                  <span className="portfolio-menu__item-inner">
                    <span className="portfolio-menu__bracket portfolio-menu__bracket--left" aria-hidden="true">
                      [
                    </span>
                    <span>{item.label}</span>
                    <span className="portfolio-menu__bracket portfolio-menu__bracket--right" aria-hidden="true">
                      ]
                    </span>
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="portfolio-menu__footer">
        {AUXILIARY_LINKS.map((label) => (
          <a
            key={label}
            className="portfolio-menu__aux-link"
            href="#"
            onClick={(event) => event.preventDefault()}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
