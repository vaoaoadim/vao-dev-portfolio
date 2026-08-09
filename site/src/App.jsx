import { HeroIntro } from "./HeroIntro";
import { MascotScrollScene } from "./MascotScrollScene";
import { PixelCursor } from "./PixelCursor";
import { PortfolioHeader } from "./PortfolioHeader";
import { SelectedWorks } from "./SelectedWorks";
import { WhatIBuild } from "./WhatIBuild";

export function App() {
  return (
    <main className="portfolio" id="top">
      <PixelCursor />
      <PortfolioHeader />
      <MascotScrollScene>
        <HeroIntro />
        <WhatIBuild />
      </MascotScrollScene>
      <SelectedWorks />
    </main>
  );
}
