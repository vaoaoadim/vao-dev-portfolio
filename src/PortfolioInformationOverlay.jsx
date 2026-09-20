import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLanguage } from "./LanguageContext";
import { isInfoOverlay, usePortfolioOverlay } from "./PortfolioOverlayContext";

function getFocusableElements(panel, brand, trigger) {
  if (!panel) return [];

  return [
    brand,
    trigger,
    ...panel.querySelectorAll('button:not([disabled]), a[href]'),
  ].filter(
    (element, index, all) =>
      element &&
      all.indexOf(element) === index &&
      element.getClientRects().length > 0 &&
      !element.hasAttribute("disabled"),
  );
}

function DocumentSections({ sections }) {
  return sections.map(([heading, text]) => (
    <section className="information-overlay__document-section" key={heading}>
      <h2>{heading}</h2>
      <p>{text}</p>
    </section>
  ));
}

function InformationContent({ overlay, content }) {
  if (overlay === "about") {
    return (
      <>
        <p className="information-overlay__eyebrow">{content.about.eyebrow}</p>
        <div className="information-overlay__copy">
          {content.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </>
    );
  }

  if (overlay === "stack") {
    return (
      <>
        <p className="information-overlay__eyebrow">{content.stack.eyebrow}</p>
        <div className="information-overlay__copy information-overlay__copy--stack">
          <p>{content.stack.intro}</p>
          <dl className="information-overlay__stack-list">
            {content.stack.items.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </>
    );
  }

  if (overlay === "privacy-policy") {
    return (
      <div className="information-overlay__copy information-overlay__copy--document">
        <p className="information-overlay__revision">{content.revision}</p>
        <p className="information-overlay__document-intro">{content.privacy.intro}</p>
        <DocumentSections sections={content.privacy.sections} />
      </div>
    );
  }

  return (
    <div className="information-overlay__copy information-overlay__copy--document">
      <p className="information-overlay__revision">{content.revision}</p>
      <p className="information-overlay__document-intro">{content.offer.intro}</p>
      <DocumentSections sections={content.offer.sections} />
    </div>
  );
}

export function PortfolioInformationOverlay() {
  const { copy } = useLanguage();
  const {
    activeOverlay,
    isClosing,
    brandRef,
    menuTriggerRef,
    requestClose,
    completeClose,
  } = usePortfolioOverlay();
  const overlayRef = useRef(null);
  const hasOpenedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isOpen = isInfoOverlay(activeOverlay);
  const title = useMemo(() => {
    if (!isOpen) return "";
    if (activeOverlay === "privacy-policy") return copy.overlays.titles.privacy;
    if (activeOverlay === "public-offer") return copy.overlays.titles.offer;
    return copy.overlays.titles[activeOverlay];
  }, [activeOverlay, copy, isOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return undefined;

      const content = overlay.querySelector(".information-overlay__content");
      gsap.killTweensOf([overlay, content]);

      if (isOpen && !isClosing) {
        hasOpenedRef.current = true;
        gsap.set(overlay, {
          autoAlpha: 1,
          pointerEvents: "auto",
          scaleY: 0,
          transformOrigin: "top center",
        });
        gsap.set(content, { autoAlpha: 0, y: reducedMotion ? 0 : 20 });

        if (reducedMotion) {
          gsap.set(content, { autoAlpha: 1, y: 0 });
          return gsap.to(overlay, { scaleY: 1, duration: 0.16, ease: "power1.out" });
        }

        return gsap
          .timeline()
          .to(overlay, { scaleY: 1, duration: 0.68, ease: "power4.inOut" })
          .to(content, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, "-=0.18");
      }

      if (!hasOpenedRef.current) {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        return undefined;
      }

      if (!isClosing) {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        return undefined;
      }

      gsap.set(overlay, { pointerEvents: "none" });
      if (reducedMotion) {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        completeClose();
        return undefined;
      }

      return gsap
        .timeline()
        .to(overlay, { scaleY: 0, duration: 0.62, ease: "power4.inOut" })
        .set(overlay, { autoAlpha: 0, pointerEvents: "none" })
        .call(completeClose);
    },
    {
      scope: overlayRef,
      dependencies: [activeOverlay, completeClose, isClosing, isOpen, reducedMotion],
    },
  );

  useEffect(() => {
    if (!isOpen || isClosing) return undefined;

    const focusDelay = window.setTimeout(
      () => menuTriggerRef.current?.focus(),
      reducedMotion ? 0 : 720,
    );

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(
        overlayRef.current,
        brandRef.current,
        menuTriggerRef.current,
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
  }, [brandRef, isClosing, isOpen, menuTriggerRef, reducedMotion, requestClose]);

  return (
    <section
      ref={overlayRef}
      className="information-overlay"
      id="portfolio-information-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="information-overlay-title"
      aria-hidden={!isOpen}
    >
      <div className="information-overlay__scroll">
        <div className="information-overlay__content">
          <h1 id="information-overlay-title">{title}</h1>
          {isOpen ? <InformationContent overlay={activeOverlay} content={copy.overlays} /> : null}
        </div>
      </div>
    </section>
  );
}
