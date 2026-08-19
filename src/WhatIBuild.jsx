import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { InteractiveBuildScene } from "./InteractiveBuildScene";
import { useLanguage } from "./LanguageContext";

const BUILD_SYMBOLS = ["{ play }", "// tg", "<> tools", "< / >", "=> mail", "[ ext ]", "ai()"];

const SCRAMBLE_SYMBOLS = "<>{}[]()|&!@#$%^*+=-~?:;.,/\\\\'\"";

function getScrambledWord(characters, revealedCharacters = 0) {
  return characters
    .map((character, index) => {
      if (character === " " || index < revealedCharacters) {
        return character;
      }

      return SCRAMBLE_SYMBOLS[Math.floor(Math.random() * SCRAMBLE_SYMBOLS.length)];
    })
    .join("");
}

export function WhatIBuild() {
  const { copy } = useLanguage();
  const sectionRef = useRef(null);
  const mascotImageRef = useRef(null);
  const { contextSafe } = useGSAP({ scope: sectionRef });

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return undefined;
      }

      const headings = gsap.utils.selector(section)(".build-name h3");
      const observers = [];
      const timelines = [];

      const revealHeading = contextSafe((heading) => {
        const wordLayers = [...heading.querySelectorAll(".build-name__word-scramble")];
        const words = wordLayers.map((layer) => layer.dataset.scrambleWord ?? "");
        const characterCount = words.reduce((total, word) => total + [...word].length, 0);
        const state = { reveal: 0, scramble: 0 };

        const renderTitle = (revealedCharacters = 0) => {
          let remainingRevealedCharacters = revealedCharacters;

          wordLayers.forEach((layer, index) => {
            const characters = [...words[index]];
            const revealedInWord = Math.min(
              characters.length,
              Math.max(0, remainingRevealedCharacters),
            );

            layer.textContent = getScrambledWord(characters, revealedInWord);
            remainingRevealedCharacters -= characters.length;
          });
        };

        renderTitle();

        const timeline = gsap
          .timeline({
            onComplete: () => {
              wordLayers.forEach((layer, index) => {
                layer.textContent = words[index];
              });
            },
          })
          .to(state, {
            scramble: 1,
            duration: 0.35,
            ease: "none",
            onUpdate: () => {
              renderTitle();
            },
          })
          .to(state, {
            reveal: 1,
            duration: 0.35,
            ease: "none",
            onUpdate: () => {
              const revealedCharacters = Math.floor(state.reveal * characterCount);
              renderTitle(revealedCharacters);
            },
          });

        timelines.push(timeline);
      });

      const observeHeading = (heading) => {
        let hasRevealed = false;
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting || hasRevealed) {
              return;
            }

            hasRevealed = true;
            observer.unobserve(heading);
            revealHeading(heading);
          },
          { threshold: 0.2 },
        );

        observer.observe(heading);
        observers.push(observer);
      };

      if ("IntersectionObserver" in window) {
        headings.forEach(observeHeading);
      } else {
        headings.forEach(revealHeading);
      }

      return () => {
        observers.forEach((observer) => observer.disconnect());
        timelines.forEach((timeline) => timeline.kill());
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="what-i-build" id="build" aria-labelledby="build-title">
      <div className="mascot-scroll-track" aria-hidden="true">
        <div className="mascot-scroll-sticky">
          <div className="mascot-scroll-motion">
            <picture>
              <source srcSet="/assets/mascot/scroll-mascot.avif" type="image/avif" />
              <source srcSet="/assets/mascot/scroll-mascot.webp" type="image/webp" />
              <img
                ref={mascotImageRef}
                className="mascot-scroll-image"
                src="/assets/mascot/scroll-mascot.png"
                alt=""
                width="1117"
                height="941"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                draggable="false"
              />
            </picture>
          </div>
        </div>
      </div>

      <InteractiveBuildScene sectionRef={sectionRef} imageRef={mascotImageRef} />

      <div className="section-kicker" aria-label={copy.build.sectionLabel}>
        <div className="section-kicker__line">
          <span>01</span>
          <span>{copy.build.kicker}</span>
        </div>
        <p className="section-kicker__instruction">
          {copy.build.instruction}
        </p>
      </div>

      <div className="what-i-build-heading">
        <h2 id="build-title">
          {copy.build.titleFirst}
          <br />
          {copy.build.titleSecond}
        </h2>
        <p>{copy.build.subtitle}</p>
      </div>

      <ol className="build-list">
        {copy.build.items.map(({ title, description }, index) => {
          const symbol = BUILD_SYMBOLS[index];

          return (
          <li key={symbol}>
            <span className="build-number">[{String(index + 1).padStart(2, "0")}]</span>
            <div className="build-name">
              <span>{symbol}</span>
              <h3 data-scramble-title={title} aria-label={title}>
                {title.split(" ").map((word, wordIndex) => (
                  <Fragment key={`${word}-${wordIndex}`}>
                    {wordIndex > 0 ? " " : null}
                    <span className="build-name__word" aria-hidden="true">
                      <span className="build-name__word-layout">{word}</span>
                      <span className="build-name__word-scramble" data-scramble-word={word}>
                        {word}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h3>
            </div>
            <p>{description}</p>
          </li>
          );
        })}
      </ol>
    </section>
  );
}
