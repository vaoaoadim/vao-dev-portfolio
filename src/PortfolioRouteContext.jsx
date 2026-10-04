import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { casePath, isPlainNavigation } from "./caseStudyRoutes";
import { sitePath } from "./sitePath";

const RouteContext = createContext(null);
const readRoute = () => ({ path: window.location.pathname, state: window.history.state?.vbuild ?? {} });

export function PortfolioRouteProvider({ children }) {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const sync = () => setRoute((current) => current.path === window.location.pathname ? current : readRoute());
    window.addEventListener("popstate", sync);
    return () => {
      window.history.scrollRestoration = previous;
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const goHome = useCallback((target) => {
    const saved = window.history.state?.vbuild?.home;
    const state = { ...saved, target: target || (saved ? undefined : "work") };
    window.history.pushState({ vbuild: state }, "", sitePath("/"));
    setRoute(readRoute());
  }, []);

  const openCase = useCallback((event, id) => {
    const path = casePath(id);
    if (!path || !isPlainNavigation(event)) return;
    event.preventDefault();
    const viewport = document.querySelector(".works-gallery__viewport");
    const home = { y: window.scrollY, project: id, galleryX: viewport?.scrollLeft ?? 0 };
    window.history.replaceState({ ...window.history.state, vbuild: home }, "");
    window.history.pushState({ vbuild: { home } }, "", path);
    setRoute(readRoute());
  }, []);

  const returnHome = useCallback((event, target) => {
    if (!isPlainNavigation(event)) return;
    event.preventDefault();
    goHome(target);
  }, [goHome]);

  return <RouteContext.Provider value={{ route, openCase, goHome, returnHome }}>{children}</RouteContext.Provider>;
}

export const usePortfolioRoute = () => useContext(RouteContext);
