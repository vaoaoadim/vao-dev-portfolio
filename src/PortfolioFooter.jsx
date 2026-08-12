import {
  GithubLogo,
  InstagramLogo,
  TelegramLogo,
  ThreadsLogo,
} from "@phosphor-icons/react";
import { usePortfolioOverlay } from "./PortfolioOverlayContext";

const SOCIAL_LINKS = [
  { label: "Telegram", Icon: TelegramLogo },
  { label: "Instagram", Icon: InstagramLogo },
  { label: "Threads", Icon: ThreadsLogo },
  { label: "GitHub", Icon: GithubLogo },
];

const LEGAL_LINKS = [
  { label: "политика конфиденциальности", overlay: "privacy-policy" },
  { label: "публичная оферта", overlay: "public-offer" },
];
const MARQUEE_ITEMS = Array.from({ length: 5 }, (_, index) => index);

function PlaceholderButton({ children, className = "", label }) {
  return (
    <button
      className={className}
      type="button"
      aria-disabled="true"
      aria-label={`${label ?? children} — ссылка появится позже`}
      title="Ссылка появится позже"
    >
      {children}
    </button>
  );
}

function MarqueeGroup() {
  return (
    <span className="portfolio-footer__marquee-group">
      {MARQUEE_ITEMS.map((item) => (
        <span className="portfolio-footer__marquee-item" key={item}>
          <span>v.build</span>
          <span>portfolio</span>
        </span>
      ))}
    </span>
  );
}

export function PortfolioFooter() {
  const { openInfo } = usePortfolioOverlay();

  return (
    <footer className="portfolio-footer" id="contacts">
      <h2 className="portfolio-footer__visually-hidden">Контакты и реквизиты</h2>

      <div className="portfolio-footer__info">
        <p className="portfolio-footer__label">03&nbsp;&nbsp; // контакты</p>

        <div className="portfolio-footer__contact">
          <a className="portfolio-footer__email" href="mailto:vbednov921@gmail.com">
            vbednov921@gmail.com
          </a>

          <nav className="portfolio-footer__socials" aria-label="Социальные сети">
            {SOCIAL_LINKS.map(({ label, Icon }) => (
              <PlaceholderButton
                className="portfolio-footer__social"
                key={label}
                label={label}
              >
                <Icon aria-hidden="true" size="1em" weight="regular" />
                <span className="portfolio-footer__visually-hidden">{label}</span>
              </PlaceholderButton>
            ))}
          </nav>
        </div>

        <div className="portfolio-footer__details">
          <p>самозанятый</p>
          <p>Беднов Вадим Дмитриевич</p>
          <p>ИНН 524711417910</p>
        </div>

        <nav className="portfolio-footer__legal" aria-label="Юридическая информация">
          {LEGAL_LINKS.map((item) => (
            <button
              className="portfolio-footer__legal-link"
              key={item.overlay}
              type="button"
              onClick={(event) => openInfo(item.overlay, event.currentTarget)}
            >
              {item.label}
            </button>
          ))}
          <span>© 2026 v.build</span>
        </nav>
      </div>

      <div className="portfolio-footer__marquee" aria-hidden="true">
        <div className="portfolio-footer__marquee-track">
          <MarqueeGroup />
          <MarqueeGroup />
        </div>
      </div>
    </footer>
  );
}
