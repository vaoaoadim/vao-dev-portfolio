import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const HERO_MEDIA = [
  { asset: "hero-file-manager", label: "File manager" },
  { asset: "hero-retro-computer", label: "Retro computer" },
  { asset: "hero-cursor", label: "Cursor" },
  { asset: "hero-floppy", label: "Floppy disk" },
  { asset: "hero-microchip", label: "Microchip" },
];

const MEDIA_INTERVAL_MS = 960;
const FONT_READY_TIMEOUT_MS = 900;

export function HeroIntro() {
  const heroRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const [activeMedia, setActiveMedia] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fontSet = document.fonts;
    let timeoutId = 0;

    const revealHero = () => {
      if (!isCurrent) return;
      window.requestAnimationFrame(() => {
        if (isCurrent) setHeroReady(true);
      });
    };

    if (!fontSet) {
      revealHero();
      return undefined;
    }

    timeoutId = window.setTimeout(revealHero, FONT_READY_TIMEOUT_MS);
    Promise.allSettled([
      fontSet.load('500 1em "Onest Variable"', "HELLO THIS IS MY DEVELOPMENT PORTFOLIO"),
      fontSet.load('400 1em "IBM Plex Mono"', "портфолио открыт для проектов"),
    ]).then(revealHero);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const interval = window.setInterval(() => {
      setActiveMedia((current) => (current + 1) % HERO_MEDIA.length);
    }, MEDIA_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useGSAP(
    () => {
      if (reducedMotion) return undefined;

      const activeImage = heroRef.current?.querySelector(
        `[data-hero-media-index="${activeMedia}"]`,
      );

      if (activeImage) {
        gsap.fromTo(
          activeImage,
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.16, ease: "power1.out" },
        );
      }

      return undefined;
    },
    {
      scope: heroRef,
      dependencies: [activeMedia, reducedMotion],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    (context, contextSafe) => {
      if (reducedMotion) return undefined;

      const moveBackground = contextSafe((event) => {
        const bounds = heroRef.current?.getBoundingClientRect();
        if (!bounds) return;

        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 16;

        gsap.to(backgroundImageRef.current, {
          x,
          y,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto",
        });
      });

      const hero = heroRef.current;
      hero?.addEventListener("pointermove", moveBackground);

      return () => {
        hero?.removeEventListener("pointermove", moveBackground);
      };
    },
    { scope: heroRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <section className="hero" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero-background" aria-hidden="true">
        <div className="hero-background-drift">
          <picture>
            <source srcSet="/assets/backgrounds/pixel-block-haze.avif" type="image/avif" />
            <source srcSet="/assets/backgrounds/pixel-block-haze.webp" type="image/webp" />
            <img
              ref={backgroundImageRef}
              src="/assets/backgrounds/pixel-block-haze.png"
              alt=""
              width="1672"
              height="941"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <div className="hero-background-veil" />
      </div>

      <div
        className={`hero-content ${heroReady ? "is-ready" : ""}`}
        data-reduced-motion={reducedMotion || undefined}
      >
        <h1 className="hero-title" id="hero-title">
          <span className="hero-line-clip">
            <span className="hero-line" data-hero-line>
              HELLO, THIS IS
            </span>
          </span>
          <span className="hero-line-clip">
            <span className="hero-line hero-line--media" data-hero-line>
              <span className="hero-code-glyph" aria-label="/ [">
                <span className="hero-code-glyph--green">/</span>{" "}
                <span className="hero-code-glyph--yellow">[</span>
              </span>
              <span className="hero-media" aria-hidden="true">
                {HERO_MEDIA.map(({ asset, label }, index) => (
                  <picture
                    key={asset}
                    className={index === activeMedia ? "is-active" : ""}
                    data-hero-media-index={index}
                  >
                    <source srcSet={`/assets/hero/${asset}.avif`} type="image/avif" />
                    <source srcSet={`/assets/hero/${asset}.webp`} type="image/webp" />
                    <img
                      src={`/assets/hero/${asset}.png`}
                      alt=""
                      width="1440"
                      height="1088"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "low"}
                      decoding="async"
                      draggable="false"
                      title={label}
                    />
                  </picture>
                ))}
              </span>
              <span className="hero-code-glyph" aria-label="] ]">
                <span className="hero-code-glyph--red">]</span>{" "}
                <span className="hero-code-glyph--orange">]</span>
              </span>
            </span>
          </span>
          <span className="hero-line-clip">
            <span className="hero-line hero-line--development" data-hero-line>
              MY DEVELOPMENT
            </span>
          </span>
          <span className="hero-line-clip">
            <span className="hero-line" data-hero-line>
              PORTFOLIO
            </span>
          </span>
        </h1>

        <div className="hero-meta" aria-label="Статус портфолио">
          <span data-hero-meta>// портфолио</span>
          <span data-hero-meta>открыт для проектов</span>
          <span data-hero-meta>листайте вниз ↓</span>
        </div>
      </div>
    </section>
  );
}
