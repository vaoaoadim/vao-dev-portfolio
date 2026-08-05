import { useEffect, useRef, useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { BuildMark3D } from "./BuildMark3D";

const navigationItems = ["Обо мне", "Политика", "Оферта"];

function PlaceholderItems({ className = "header-navigation" }) {
  return (
    <div className={className} aria-label="Navigation links coming soon">
      {navigationItems.map((label) => (
        <button key={label} type="button" disabled>
          {label}
        </button>
      ))}
    </div>
  );
}

export function PortfolioHeader({ theme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerCloseRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);
  const reloadPage = () => window.location.reload();

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    drawerCloseRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className="portfolio-header" data-theme={theme}>
        <BuildMark3D
          theme={theme}
          text="PORTFOLIO"
          fontSize={2.8}
          className="header-brand-mark"
          ariaLabel="Reload page"
          onActivate={reloadPage}
        />

        <PlaceholderItems />

        <button className="header-contact" type="button" disabled>
          Связаться
        </button>

        <button
          className="header-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="portfolio-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <XIcon weight="regular" /> : <ListIcon weight="regular" />}
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu-layer" data-theme={theme}>
          <button
            className="mobile-menu-backdrop"
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <aside
            id="portfolio-mobile-menu"
            className="mobile-menu-drawer"
            role="dialog"
            aria-label="Portfolio menu"
            aria-modal="true"
          >
            <button
              ref={drawerCloseRef}
              className="mobile-menu-close"
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <XIcon weight="regular" />
            </button>
            <PlaceholderItems className="mobile-menu-navigation" />
            <button className="mobile-menu-contact" type="button" disabled>
              Связаться
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
