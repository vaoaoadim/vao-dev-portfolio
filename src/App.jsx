import { HeroIntro } from "./HeroIntro";
import { MascotScrollScene } from "./MascotScrollScene";
import { PixelCursor } from "./PixelCursor";
import { PortfolioFooter } from "./PortfolioFooter";
import { PortfolioHeader } from "./PortfolioHeader";
import { PortfolioInformationOverlay } from "./PortfolioInformationOverlay";
import { PortfolioOverlayProvider } from "./PortfolioOverlayContext";
import { SelectedWorks } from "./SelectedWorks";
import { WhatIBuild } from "./WhatIBuild";

export function App() {
  return (
    <PortfolioOverlayProvider>
      <main className="portfolio" id="top">
        <PixelCursor />
        <PortfolioHeader />
        <div className="portfolio-content">
          <MascotScrollScene>
            <HeroIntro />
            <WhatIBuild />
          </MascotScrollScene>
          <SelectedWorks />
          <PortfolioFooter />
        </div>
        <PortfolioInformationOverlay />
      </main>
    </PortfolioOverlayProvider>
  );
}
