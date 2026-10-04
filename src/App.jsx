import { lazy, Suspense, useState } from "react";
import { PixelCursor } from "./PixelCursor";
import { PortfolioHeader } from "./PortfolioHeader";
import { PortfolioInformationOverlay } from "./PortfolioInformationOverlay";
import { PortfolioOverlayProvider } from "./PortfolioOverlayContext";
import { PortfolioRouteProvider, usePortfolioRoute } from "./PortfolioRouteContext";
import { isCasePath } from "./caseStudyRoutes";
const PortfolioHome = lazy(() => import("./PortfolioHome"));
const CaseStudyPage = lazy(() => import("./CaseStudyPage"));

export function App() {
  return (
    <PortfolioRouteProvider>
      <PortfolioOverlayProvider><PortfolioPages /></PortfolioOverlayProvider>
    </PortfolioRouteProvider>
  );
}

function PortfolioPages() {
  const { route } = usePortfolioRoute();
  const isCase = isCasePath(route.path);
  const [homeVisited, setHomeVisited] = useState(!isCase);
  if (!isCase && !homeVisited) setHomeVisited(true);
  return (
      <main className={`portfolio${isCase ? " portfolio--case" : ""}`} id="top">
        <PixelCursor />
        <PortfolioHeader />
        <div className="portfolio-content">
          <Suspense fallback={<div className="portfolio-page-loading" aria-busy="true" />}>
            {homeVisited && <PortfolioHome active={!isCase} restore={route.state} />}
            {isCase && <CaseStudyPage key={route.path} path={route.path} />}
          </Suspense>
        </div>
        <PortfolioInformationOverlay />
      </main>
  );
}
