import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

gsap.registerPlugin(useGSAP);

export function SectionPanel({ section, t, reducedMotion, onClosed }) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  const closingRef = useRef(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const isCaseDetail = section === "work" && Boolean(selectedCase);

  const { contextSafe } = useGSAP(
    () => {
      const duration = reducedMotion ? 0 : 0.52;
      gsap
        .timeline({ defaults: { overwrite: "auto" } })
        .fromTo(
          ".panel-scrim",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: reducedMotion ? 0 : 0.24, ease: "power2.out" },
          0,
        )
        .fromTo(
          panelRef.current,
          { xPercent: 104, autoAlpha: reducedMotion ? 1 : 0.92 },
          { xPercent: 0, autoAlpha: 1, duration, ease: "power4.out" },
          0,
        );
    },
    { scope: rootRef },
  );

  const requestClose = contextSafe(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const duration = reducedMotion ? 0 : 0.3;
    gsap
      .timeline({ onComplete: onClosed, defaults: { overwrite: "auto" } })
      .to(panelRef.current, {
        xPercent: 104,
        autoAlpha: reducedMotion ? 1 : 0.92,
        duration,
        ease: "power3.in",
      })
      .to(
        ".panel-scrim",
        {
          autoAlpha: 0,
          duration: reducedMotion ? 0 : 0.18,
          ease: "power2.in",
        },
        0,
      );
  });

  useGSAP(
    () => {
      if (!bodyRef.current || reducedMotion) return;
      gsap.fromTo(
        bodyRef.current,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.34,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    },
    {
      scope: panelRef,
      dependencies: [selectedCase, section, reducedMotion],
    },
  );

  useEffect(() => {
    setSelectedCase(null);
  }, [section]);

  useEffect(() => {
    const panel = panelRef.current;
    panel?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (document.activeElement === panel) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  return (
    <div ref={rootRef} className="panel-layer" role="presentation">
      <button
        className="panel-scrim"
        type="button"
        tabIndex="-1"
        aria-label={t.close}
        onClick={requestClose}
      />
      <aside
        ref={panelRef}
        className="content-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={isCaseDetail ? "case-title" : "panel-title"}
        tabIndex="-1"
      >
        <header className="panel-header">
          <p>
            <span>{String(["work", "about", "services", "contact"].indexOf(section) + 1).padStart(2, "0")}</span>
            {t.panel[section].kicker}
          </p>
          <button
            className="panel-close"
            type="button"
            aria-label={t.close}
            onClick={requestClose}
          >
            <XIcon aria-hidden="true" />
          </button>
        </header>

        <div ref={bodyRef} className="panel-body">
          {!isCaseDetail && (
            <div className="panel-title">
              <h2 id="panel-title">{t.panel[section].title}</h2>
              <p>{t.panel[section].intro}</p>
            </div>
          )}

          {section === "work" && (
            <WorkContent
              t={t}
              selectedCase={selectedCase}
              setSelectedCase={setSelectedCase}
            />
          )}
          {section === "about" && <AboutContent t={t} />}
          {section === "services" && <ServicesContent t={t} />}
          {section === "contact" && <ContactContent t={t} />}
        </div>
      </aside>
    </div>
  );
}

function WorkContent({ t, selectedCase, setSelectedCase }) {
  const activeCase = t.cases.find((item) => item.id === selectedCase);

  if (activeCase) {
    return (
      <article className="case-detail">
        <button
          className="text-control"
          type="button"
          onClick={() => setSelectedCase(null)}
        >
          <ArrowLeftIcon aria-hidden="true" />
          {t.backToCases}
        </button>
        <p className="case-meta">
          {activeCase.number} / {activeCase.type}
        </p>
        <h3 id="case-title">{activeCase.title}</h3>
        <p>{activeCase.summary}</p>
        <div className="placeholder-note">
          <span>{t.placeholder}</span>
          <p>{activeCase.detail}</p>
        </div>
      </article>
    );
  }

  return (
    <div className="case-list">
      {t.cases.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => setSelectedCase(item.id)}
        >
          <span className="case-number">{item.number}</span>
          <span className="case-copy">
            <small>{item.type}</small>
            <strong>{item.title}</strong>
            <span>{item.summary}</span>
          </span>
          <ArrowRightIcon aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function AboutContent({ t }) {
  return (
    <div className="fact-list">
      {t.aboutFacts.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}

function ServicesContent({ t }) {
  return (
    <div className="service-list">
      {t.services.map((service) => (
        <article key={service.number}>
          <span>{service.number}</span>
          <h3>{service.title}</h3>
          <p>{service.text}</p>
        </article>
      ))}
    </div>
  );
}

function ContactContent({ t }) {
  return (
    <div className="contact-placeholder">
      <EnvelopeSimpleIcon aria-hidden="true" />
      <p>{t.contactState}</p>
    </div>
  );
}
