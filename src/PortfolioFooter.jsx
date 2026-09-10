import {
  GithubLogo,
  InstagramLogo,
  TelegramLogo,
  ThreadsLogo,
} from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { AVATAR_SEQUENCE } from "./footerAvatarSequence";
import { useLanguage } from "./LanguageContext";
import { usePortfolioOverlay } from "./PortfolioOverlayContext";

const SOCIAL_LINKS = [
  { label: "Telegram", Icon: TelegramLogo, href: "https://web.telegram.org/k/#@vaoaoadim" },
  { label: "Instagram", Icon: InstagramLogo },
  { label: "Threads", Icon: ThreadsLogo },
  {
    label: "GitHub",
    Icon: GithubLogo,
    href: "https://github.com/vaoaoadim?tab=overview&from=2026-08-01&to=2026-08-08",
  },
];

const LEGAL_LINKS = [
  { labelKey: "privacy", overlay: "privacy-policy" },
  { labelKey: "offer", overlay: "public-offer" },
];
function PlaceholderButton({ children, className = "", label, unavailableLabel, title }) {
  return (
    <button
      className={className}
      type="button"
      aria-disabled="true"
      aria-label={unavailableLabel}
      title={title}
    >
      {children}
    </button>
  );
}

export function PortfolioFooter() {
  const { copy, interpolate } = useLanguage();
  const { openInfo } = usePortfolioOverlay();
  const avatarRowRef = useRef(null);

  useEffect(() => {
    const row = avatarRowRef.current;
    if (!row) return undefined;

    const setVisible = (isVisible) => {
      row.dataset.visible = String(isVisible);
    };

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );

    observer.observe(row);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer className="portfolio-footer" id="contacts">
      <h2 className="portfolio-footer__visually-hidden">{copy.footer.title}</h2>

      <div className="portfolio-footer__info">
        <p className="portfolio-footer__label">03&nbsp;&nbsp; {copy.footer.kicker}</p>

        <div className="portfolio-footer__contact">
          <a className="portfolio-footer__email" href="mailto:vbednov921@gmail.com">
            vbednov921@gmail.com
          </a>

          <nav className="portfolio-footer__socials" aria-label={copy.footer.socialLabel}>
            {SOCIAL_LINKS.map(({ label, Icon, href }) =>
              href ? (
                <a
                  className="portfolio-footer__social"
                  href={href}
                  key={label}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <Icon aria-hidden="true" size="1em" weight="regular" />
                  <span className="portfolio-footer__visually-hidden">{label}</span>
                </a>
              ) : (
                <PlaceholderButton
                  className="portfolio-footer__social"
                  key={label}
                  label={label}
                  unavailableLabel={interpolate(copy.footer.unavailable, { label })}
                  title={copy.footer.unavailableTitle}
                >
                  <Icon aria-hidden="true" size="1em" weight="regular" />
                  <span className="portfolio-footer__visually-hidden">{label}</span>
                </PlaceholderButton>
              ),
            )}
          </nav>
        </div>

        <div className="portfolio-footer__details">
          <p>{copy.footer.status}</p>
          <p>{copy.footer.owner}</p>
          <p>{copy.footer.taxId}</p>
        </div>

        <nav className="portfolio-footer__legal" aria-label={copy.footer.legalLabel}>
          {LEGAL_LINKS.map((item) => (
            <button
              className="portfolio-footer__legal-link"
              key={item.overlay}
              type="button"
              onClick={(event) => openInfo(item.overlay, event.currentTarget)}
            >
              {copy.footer[item.labelKey]}
            </button>
          ))}
          <span>© 2026 v.build</span>
        </nav>
      </div>

      <div className="portfolio-footer__avatar-row" aria-hidden="true" ref={avatarRowRef}>
        <div className="portfolio-footer__avatar-track">
          {[0, 1].map((sequence) => (
            <div className="portfolio-footer__avatar-sequence" key={sequence}>
              {AVATAR_SEQUENCE.map(({ id, sources }, index) => (
                <picture className="portfolio-footer__avatar" key={`${id}-${index}`}>
                  <source srcSet={sources.avif} type="image/avif" />
                  <source srcSet={sources.webp} type="image/webp" />
                  <img
                    src={sources.png}
                    alt=""
                    width="1254"
                    height="1254"
                    draggable="false"
                  />
                </picture>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
