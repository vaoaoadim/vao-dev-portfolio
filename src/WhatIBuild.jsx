import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { InteractiveBuildScene } from "./InteractiveBuildScene";

const buildItems = [
  {
    title: "MINI APPS & GAMES",
    symbol: "{ play }",
    description: "Небольшие продукты и игровые механики, которые быстро объясняют идею и вовлекают пользователя.",
  },
  {
    title: "TELEGRAM BOTS",
    symbol: "// tg",
    description: "Боты для сервисов, коммуникации и процессов — с понятными сценариями и без лишней сложности.",
  },
  {
    title: "PLUGINS & SCRIPTS",
    symbol: "<> tools",
    description: "Небольшой софт и автоматизации, которые снимают повторяющиеся задачи с команды.",
  },
  {
    title: "WEBSITES",
    symbol: "< / >",
    description: "Сайты и промостраницы с выразительной подачей, ясной структурой и аккуратной реализацией.",
  },
  {
    title: "EMAIL AUTOMATION",
    symbol: "=> mail",
    description: "Автоматические цепочки писем, уведомления и интеграции для регулярных процессов.",
  },
  {
    title: "BROWSER EXTENSIONS",
    symbol: "[ ext ]",
    description: "Расширения и desktop-инструменты, которые добавляют нужный сценарий прямо в рабочую среду.",
  },
  {
    title: "AI INTEGRATIONS",
    symbol: "ai()",
    description: "ИИ-интеграции и автоматизация процессов там, где они дают реальную пользу продукту.",
  },
];

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

      <div className="section-kicker" aria-label="Section 01">
        <div className="section-kicker__line">
          <span>01</span>
          <span>// спектр услуг</span>
        </div>
        <p className="section-kicker__instruction">
          [ жми на маркер или урну — отвлекись от дел ]
        </p>
      </div>

      <div className="what-i-build-heading">
        <h2 id="build-title">
          WHAT I
          <br />
          BUILD
        </h2>
        <p>Из интерфейса — в работающий продукт.</p>
      </div>

      <ol className="build-list">
        {buildItems.map(({ title, symbol, description }, index) => (
          <li key={title}>
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
        ))}
      </ol>
    </section>
  );
}
