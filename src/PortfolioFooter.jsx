import {
  GithubLogo,
  InstagramLogo,
  TelegramLogo,
  ThreadsLogo,
} from "@phosphor-icons/react";
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
const MARQUEE_ITEMS = Array.from({ length: 5 }, (_, index) => index);

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

function MarqueeGroup({ text }) {
  return (
    <span className="portfolio-footer__marquee-group">
      {MARQUEE_ITEMS.map((item) => (
        <span className="portfolio-footer__marquee-item" key={item}>
          <span>{text}</span>
        </span>
      ))}
    </span>
  );
}

export function PortfolioFooter() {
  const { copy, interpolate } = useLanguage();
  const { openInfo } = usePortfolioOverlay();

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

      <div className="portfolio-footer__marquee" aria-hidden="true">
        <div className="portfolio-footer__marquee-track">
          <MarqueeGroup text={copy.footer.marquee} />
          <MarqueeGroup text={copy.footer.marquee} />
          <MarqueeGroup text={copy.footer.marquee} />
        </div>
      </div>
    </footer>
  );
}
