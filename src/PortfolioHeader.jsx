import { PortfolioMenu } from "./PortfolioMenu";
import { usePortfolioOverlay } from "./PortfolioOverlayContext";

export function PortfolioHeader() {
  const {
    activeOverlay,
    isClosing,
    menuUnderlayActive,
    brandRef,
    menuTriggerRef,
    openMenu,
    openInfo,
    navigateToSection,
    requestClose,
    completeClose,
  } = usePortfolioOverlay();
  const isMenuOpen = activeOverlay === "menu" || menuUnderlayActive;
  const isOverlayOpen = activeOverlay !== null;

  return (
    <>
      <header className={`portfolio-header ${activeOverlay === "menu" ? "is-menu-open" : ""}`}>
        <a
          ref={brandRef}
          className="portfolio-brand"
          href="#top"
          aria-label="v.build — к началу страницы"
        >
          v.build
        </a>
        <button
          ref={menuTriggerRef}
          className="portfolio-menu-label"
          type="button"
          onClick={isOverlayOpen ? requestClose : (event) => openMenu(event.currentTarget)}
          aria-expanded={isOverlayOpen}
          aria-controls={
            activeOverlay === "menu"
              ? "portfolio-menu"
              : activeOverlay
                ? "portfolio-information-overlay"
                : "portfolio-menu"
          }
          aria-label={isOverlayOpen ? "Закрыть" : "Открыть меню"}
        >
          {isOverlayOpen ? "close" : "more"}
        </button>
      </header>

      <PortfolioMenu
        isOpen={isMenuOpen}
        isInteractive={activeOverlay === "menu"}
        isClosing={activeOverlay === "menu" && isClosing}
        onClose={requestClose}
        onClosed={completeClose}
        onNavigate={navigateToSection}
        onOpenInfo={openInfo}
        brandRef={brandRef}
        triggerRef={menuTriggerRef}
      />
    </>
  );
}
