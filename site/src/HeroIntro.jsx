import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const HERO_MEDIA = [
  { src: "/assets/hero/hero-file-manager.png", label: "File manager" },
  { src: "/assets/hero/hero-retro-computer.png", label: "Retro computer" },
  { src: "/assets/hero/hero-cursor.png", label: "Cursor" },
  { src: "/assets/hero/hero-floppy.png", label: "Floppy disk" },
  { src: "/assets/hero/hero-microchip.png", label: "Microchip" },
];

const MEDIA_INTERVAL_MS = 960;

export function HeroIntro() {
  const heroRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const [activeMedia, setActiveMedia] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    HERO_MEDIA.forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
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

      return gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero-line]", {
          yPercent: 108,
          duration: 0.72,
          stagger: 0.09,
        })
        .from(
          "[data-hero-meta]",
          {
            autoAlpha: 0,
            y: 10,
            duration: 0.38,
            stagger: 0.06,
          },
          "-=0.28",
        );
    },
    { scope: heroRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

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
          <img
            ref={backgroundImageRef}
            src="/assets/backgrounds/pixel-block-haze.png"
            alt=""
            width="1672"
            height="941"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="hero-background-veil" />
      </div>

      <div className="hero-content">
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
                {HERO_MEDIA.map(({ src, label }, index) => (
                  <img
                    key={src}
                    className={index === activeMedia ? "is-active" : ""}
                    data-hero-media-index={index}
                    src={src}
                    alt=""
                    width="1440"
                    height="1088"
                    loading="eager"
                    decoding="async"
                    draggable="false"
                    title={label}
                  />
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
