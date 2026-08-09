import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { sectionOrder } from "./content.js";

gsap.registerPlugin(useGSAP);

const objectClass = {
  work: "object-work",
  about: "object-about",
  services: "object-services",
  contact: "object-contact",
};

export function ImageDiorama({
  locale,
  t,
  lightsOn,
  motionOff,
  motionPaused,
  onActivate,
  onSwitchLocale,
  onToggleLight,
  onToggleMotion,
}) {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const sceneAsset = `/assets/diorama-controls-${locale}`;

  useGSAP(
    () => {
      if (motionOff) {
        gsap.set(frameRef.current, { autoAlpha: 1, scale: 1 });
        return;
      }

      gsap.fromTo(
        frameRef.current,
        { autoAlpha: 0.94, scale: 1.012 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.86,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    },
    { scope: rootRef, dependencies: [locale, motionOff] },
  );

  return (
    <section
      ref={rootRef}
      className="image-diorama"
      aria-label={t.fallbackTitle}
    >
      <div
        ref={frameRef}
        className="diorama-frame"
        data-locale={locale}
      >
        <picture className="scene-picture" aria-hidden="true">
          <source srcSet={`${sceneAsset}.avif`} type="image/avif" />
          <source srcSet={`${sceneAsset}.webp`} type="image/webp" />
          <img
            src={`${sceneAsset}.webp`}
            alt=""
            width="1536"
            height="1024"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <div className="light-state" aria-hidden="true" />
        <div className="lamp-glow" aria-hidden="true" />

        <div className="scene-cleanups" aria-hidden="true">
          {sectionOrder.map((section) => (
            <span
              className={`scene-cleanup cleanup-${section}`}
              key={section}
            />
          ))}
        </div>

        <nav
          id="scene-navigation"
          className="scene-navigation"
          aria-label={t.fallbackTitle}
        >
          {sectionOrder.map((section) => (
            <button
              className={`object-control ${objectClass[section]}`}
              type="button"
              key={section}
              aria-label={t.buildingHint[section]}
              onClick={(event) => onActivate(section, event.currentTarget)}
            />
          ))}
        </nav>

        <div className="scene-labels" aria-hidden="true">
          {sectionOrder.map((section) => (
            <span
              className={`scene-label label-${section}`}
              key={section}
            >
              {t.nav[section]}
            </span>
          ))}
        </div>

        <button
          className="scene-hitarea lamp-control"
          type="button"
          aria-label={lightsOn ? t.lightOff : t.lightOn}
          aria-pressed={lightsOn}
          onClick={onToggleLight}
        />

        <button
          className="scene-hitarea locale-control"
          type="button"
          aria-label={t.languageSwitch}
          onClick={onSwitchLocale}
        />

        <button
          className="scene-hitarea motion-control"
          type="button"
          aria-label={motionPaused ? t.motionPlay : t.motionPause}
          aria-pressed={motionPaused}
          onClick={onToggleMotion}
        />
      </div>
    </section>
  );
}
