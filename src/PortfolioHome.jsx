import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroIntro } from "./HeroIntro";
import { MascotScrollScene } from "./MascotScrollScene";
import { PortfolioFooter } from "./PortfolioFooter";
import { SelectedWorks } from "./SelectedWorks";
import { WhatIBuild } from "./WhatIBuild";

export default function PortfolioHome({ active, restore }) {
  const root = useRef(null);
  const paused = useRef([]);
  useLayoutEffect(() => {
    if (!active) {
      paused.current = ScrollTrigger.getAll().filter((trigger) => root.current?.contains(trigger.trigger));
      paused.current.forEach((trigger) => trigger.disable(false));
      return;
    }
    paused.current.forEach((trigger) => trigger.enable(false, false));
    paused.current = [];
    let frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      frame = requestAnimationFrame(() => {
        if (restore.target) document.getElementById(restore.target)?.scrollIntoView({ block: "start" });
        else if (Number.isFinite(restore.y)) window.scrollTo(0, restore.y);
        if (Number.isFinite(restore.galleryX)) {
          const viewport = root.current?.querySelector(".works-gallery__viewport");
          if (viewport) viewport.scrollLeft = restore.galleryX;
        }
        if (restore.project) root.current?.querySelector(`[data-case-id="${restore.project}"]`)?.focus({ preventScroll: true });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [active, restore]);
  return <div ref={root} className="portfolio-home" hidden={!active} inert={!active}>
    <MascotScrollScene><HeroIntro /><WhatIBuild /></MascotScrollScene>
    <SelectedWorks /><PortfolioFooter />
  </div>;
}
