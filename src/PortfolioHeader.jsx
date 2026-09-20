import { PortfolioMenu } from "./PortfolioMenu";
import { useLanguage } from "./LanguageContext";
import { usePortfolioOverlay } from "./PortfolioOverlayContext";

export function PortfolioHeader() {
  const { language, copy, selectLanguage } = useLanguage();
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
        <div className="portfolio-header__identity">
          <a
            ref={brandRef}
            className="portfolio-brand"
            href="#top"
            aria-label={copy.header.brandLabel}
          >
            v.build
          </a>
          <a className="portfolio-header__contact" href="#contacts">
            {copy.header.contact}
          </a>
        </div>
        <div className="portfolio-header__actions">
          <div
            className="language-switch"
            role="group"
            aria-label={copy.header.languageGroup}
          >
            <button
              type="button"
              className={language === "ru" ? "is-active" : undefined}
              aria-label={copy.header.chooseRussian}
              aria-pressed={language === "ru"}
              onClick={() => selectLanguage("ru")}
            >
              ru
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              className={language === "en" ? "is-active" : undefined}
              aria-label={copy.header.chooseEnglish}
              aria-pressed={language === "en"}
              onClick={() => selectLanguage("en")}
            >
              en
            </button>
          </div>
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
            aria-label={isOverlayOpen ? copy.header.close : copy.header.openMenu}
          >
            {isOverlayOpen ? copy.header.closeLabel : copy.header.more}
          </button>
        </div>
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
