import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { BeautyBombGamePopup } from "./BeautyBombGamePopup";
import { useLanguage } from "./LanguageContext";
import { usePortfolioRoute } from "./PortfolioRouteContext";
import { caseStudyCopy, getCaseStudy } from "./caseStudies";
import "./caseStudy.css";

function ProjectCTA({ project, labels, triggerRef, onPlay }) {
  const bounds = useRef(null);
  const embedded = project.interaction === "embedded-game";
  const Tag = embedded ? "button" : "a";
  const reset = (event) => {
    event.currentTarget.style.removeProperty("--cta-x");
    event.currentTarget.style.removeProperty("--cta-y");
    bounds.current = null;
  };
  const props = embedded
    ? { type: "button", onClick: onPlay, "aria-haspopup": "dialog" }
    : { href: project.href, target: "_blank", rel: "noopener noreferrer" };

  return <Tag
    {...props}
    ref={triggerRef}
    className="case-project-cta"
    data-cursor="interactive"
    onPointerEnter={(event) => {
      if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
        bounds.current = event.currentTarget.getBoundingClientRect();
      }
    }}
    onPointerMove={(event) => {
      if (!bounds.current) return;
      const rect = bounds.current;
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
      event.currentTarget.style.setProperty("--cta-x", `${x}px`);
      event.currentTarget.style.setProperty("--cta-y", `${y}px`);
    }}
    onPointerLeave={reset}
    onPointerCancel={reset}
    onBlur={reset}
  >
    <span className="case-project-cta__note">{embedded ? labels.embedded : labels.external}</span>
    <span className="case-project-cta__action">
      <span aria-hidden="true" className="case-project-cta__bracket">[</span>
      <span>{embedded ? labels.play : labels.open}</span>
      <span className="case-project-cta__arrow" aria-hidden="true">↗</span>
      <span aria-hidden="true" className="case-project-cta__bracket">]</span>
    </span>
    <span className="case-project-cta__project">{project.title}</span>
  </Tag>;
}

function CaseSection({ number, title, children, dark = false }) {
  return <section className={`case-section${dark ? " case-section--dark" : ""}`}>
    <div className="case-section__label"><span>{String(number).padStart(2, "0")}</span><h2>{title}</h2></div>
    <div className="case-section__body">{children}</div>
  </section>;
}

function Paragraphs({ items }) {
  return items?.map((text) => <p key={text}>{text}</p>);
}

// Future screenshots can be added in data without changing the page composition.
function CaseMedia({ media }) {
  return media?.map((item) => <figure className="case-media" key={item.src}>
    <picture>
      {item.avif && <source srcSet={item.avif} type="image/avif" />}
      {item.webp && <source srcSet={item.webp} type="image/webp" />}
      <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" />
    </picture>
    {item.caption && <figcaption>{item.caption}</figcaption>}
  </figure>);
}

export default function CaseStudyPage({ path }) {
  const { language, copy } = useLanguage();
  const { returnHome } = usePortfolioRoute();
  const labels = caseStudyCopy[language];
  const project = getCaseStudy(path, copy, language);
  const article = useRef(null);
  const heading = useRef(null);
  const trigger = useRef(null);
  const [gameOpen, setGameOpen] = useState(false);
  const closeGame = useCallback(() => setGameOpen(false), []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [path]);

  useEffect(() => {
    const portfolio = article.current?.closest(".portfolio");
    const header = portfolio?.querySelector(".portfolio-header");
    const darkSections = article.current?.querySelectorAll(".case-section--dark, .case-project-cta");
    if (!portfolio || !header || !darkSections?.length) return;
    let observer;
    const observe = () => {
      observer?.disconnect();
      const bounds = header.getBoundingClientRect();
      const center = Math.max(0, Math.min(window.innerHeight - 1, (bounds.top + bounds.bottom) / 2));
      const visible = new Set();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        const section = [...visible][0];
        portfolio.dataset.caseHeaderTone = section
          ? section.classList.contains("case-project-cta") ? "cta" : "dark"
          : "light";
      }, { rootMargin: `-${center}px 0px -${window.innerHeight - center - 1}px 0px` });
      darkSections.forEach((section) => observer.observe(section));
    };
    observe();
    const resize = new ResizeObserver(observe);
    resize.observe(header);
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", observe);
      delete portfolio.dataset.caseHeaderTone;
    };
  }, [path]);

  useEffect(() => {
    document.title = `${project?.title || labels.notFoundTitle} | v.build`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", project?.description || labels.notFound);
    return () => {
      document.title = copy.meta.title;
      description?.setAttribute("content", copy.meta.description);
    };
  }, [path, language, project?.title, project?.description, copy.meta, labels]);

  useGSAP(() => {
    if (!project || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".case-hero__title, .case-hero__details, .case-hero__read", {
      y: 26, opacity: 0, duration: 0.55, stagger: 0.09, ease: "power2.out", clearProps: "transform,opacity",
    });
  }, { scope: article, dependencies: [path] });

  let number = 1;
  return <article ref={article} className="case-study" aria-labelledby="case-title">
    <nav className="case-nav" aria-label={labels.back}>
      <a href="/#work" onClick={returnHome} data-cursor="interactive">{labels.back}</a>
      <span>{labels.caseLabel}{project ? ` / ${String(project.index).padStart(2, "0")}` : ""}</span>
    </nav>
    {!project ? <header className="case-hero">
      <h1 ref={heading} id="case-title" tabIndex="-1">{labels.notFoundTitle}</h1>
      <p>{labels.notFound}</p>
    </header> : <>
      <header className="case-hero">
        <h1 ref={heading} id="case-title" tabIndex="-1" className={`case-hero__title${project.title.length > 12 ? " case-hero__title--long" : ""}`}>{project.title}</h1>
        <div className="case-hero__details">
          <dl className="case-hero__metadata">
            <div><dt>{labels.type}</dt><dd>{project.category}</dd></div>
            {project.year && <div><dt>{labels.year}</dt><dd>{project.year}</dd></div>}
            <div><dt className="visually-hidden">{language === "ru" ? "Статус" : "Status"}</dt><dd>{project.concept ? labels.concept : labels.live}</dd></div>
          </dl>
          <p className="case-hero__summary">{project.description}</p>
        </div>
        <div className="case-hero__launch">
          <ProjectCTA project={project} labels={labels} triggerRef={trigger} onPlay={() => setGameOpen(true)} />
        </div>
        <a className="case-hero__read" href="#case-story">{labels.read}</a>
      </header>

      <div id="case-story" className="case-story">
        {project.overview?.length > 0 && <CaseSection number={number++} title={labels.overview}><Paragraphs items={project.overview} /></CaseSection>}
        {project.challenge?.length > 0 && <CaseSection number={number++} title={labels.challenge}><Paragraphs items={project.challenge} /></CaseSection>}
        {project.keyProblems?.length > 0 && <CaseSection number={number++} title={labels.problems}>
          <div className="case-problems">{project.keyProblems.map((item, index) => <div className="case-problem" key={item.title}>
            <span aria-hidden="true">/{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div>
          </div>)}</div>
        </CaseSection>}
        {project.decisions?.length > 0 && <CaseSection number={number++} title={labels.decisions}>
          <div className="case-decisions">{project.decisions.map((item) => <dl className="case-decision" key={item.decision}>
            {[["constraint", labels.constraint], ["decision", labels.decision], ["effect", labels.effect]].map(([key, label]) => item[key] && <div key={key}><dt>{label}</dt><dd>{item[key]}</dd></div>)}
          </dl>)}</div>
        </CaseSection>}
        <CaseMedia media={project.media} />
        {project.stack?.length > 0 && <CaseSection number={number++} title={labels.stack} dark>
          <p className="case-tools-note">{labels.toolsNote}</p>
          <ul className="case-stack">{project.stack.map((tool) => <li key={tool}>{tool}</li>)}</ul>
        </CaseSection>}
        {project.role?.length > 0 && <CaseSection number={number++} title={labels.role}><Paragraphs items={project.role} /></CaseSection>}
        {project.outcome?.length > 0 && <CaseSection number={number++} title={labels.outcome}><Paragraphs items={project.outcome} /></CaseSection>}
      </div>
      <div className="case-launch">
        <a className="case-launch__back" href="/#work" onClick={returnHome}>{labels.back}</a>
      </div>
      {project.interaction === "embedded-game" && <BeautyBombGamePopup open={gameOpen} onClose={closeGame} triggerRef={trigger} closeLabel={labels.closeGame} />}
    </>}
  </article>;
}
