import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { isInfoOverlay, usePortfolioOverlay } from "./PortfolioOverlayContext";

const STACK_ITEMS = [
  ["FRONTEND", "React, TypeScript, JavaScript, Vite, HTML, CSS, адаптивная вёрстка, GSAP и scroll-driven interfaces."],
  ["BACKEND & DATA", "Node.js, REST API, вебхуки, PostgreSQL, Supabase, Firebase, авторизация, серверная логика и базы данных."],
  ["INTEGRATIONS", "Telegram Bot API, CRM и внешние API, платёжные API, email-автоматизация, уведомления, аналитика и внутренние сервисы."],
  ["INFRASTRUCTURE", "Git, GitHub, CI/CD, deployment, домены, hosting, Cloudflare/Vercel и настройка production-среды."],
  ["AI", "OpenAI API и другие model APIs, AI-автоматизация, prompt design, AI-функции в продуктах, RAG и работа с данными — там, где ИИ даёт реальную пользу пользователю или команде."],
];

const POLICY_SECTIONS = [
  ["1. Общие положения", "Настоящая Политика обработки персональных данных действует в отношении сайта v.build и определяет порядок обработки персональных данных пользователей. Оператор: самозанятый Беднов Вадим Дмитриевич, ИНН 524711417910, email: vbednov921@gmail.com."],
  ["2. Какие данные могут обрабатываться", "При обращении по электронной почте могут обрабатываться имя, адрес email, содержание обращения и иные сведения, которые пользователь добровольно указывает в письме. Техническая инфраструктура сайта может также обрабатывать технические сведения, необходимые для работы сайта и защиты от сбоев."],
  ["3. Цели и правовые основания", "Данные используются для ответа на обращение, обсуждения и исполнения заказа, ведения деловой переписки, соблюдения требований законодательства и защиты прав сторон. Основание обработки зависит от ситуации: согласие пользователя, заключение и исполнение договора, а также обязанности, установленные законодательством."],
  ["4. Принципы и срок хранения", "Обрабатываются только данные, необходимые для заявленной цели. Они хранятся не дольше, чем это требуется для переписки, исполнения договорённостей, бухгалтерского и налогового учёта либо иных обязанностей по закону."],
  ["5. Передача третьим лицам", "Данные не продаются и не передаются третьим лицам без законного основания. Передача возможна техническим подрядчикам, обеспечивающим работу почты, хостинга или иных подключённых сервисов, а также государственным органам — в случаях, предусмотренных законом."],
  ["6. Права пользователя", "Пользователь вправе запросить сведения об обработке своих данных, уточнить их, отозвать согласие в применимых случаях и потребовать прекращения обработки при наличии законных оснований. Для этого направьте обращение на vbednov921@gmail.com."],
  ["7. Защита и актуализация", "Оператор применяет разумные организационные и технические меры защиты данных. Политика может обновляться при изменении процессов обработки или законодательства; актуальная редакция публикуется на этой странице."],
];

const OFFER_SECTIONS = [
  ["1. Статус документа", "Настоящий текст устанавливает общие условия выполнения работ и оказания услуг по разработке цифровых продуктов. Конкретный состав работ, стоимость, сроки, порядок оплаты и результат определяются индивидуально в переписке, техническом задании, коммерческом предложении, счёте или ином согласованном документе."],
  ["2. Исполнитель", "Исполнитель: самозанятый Беднов Вадим Дмитриевич, ИНН 524711417910, email: vbednov921@gmail.com."],
  ["3. Предмет", "Исполнитель может выполнять работы по разработке сайтов, веб-приложений, Telegram-ботов, автоматизаций, интеграций, интерфейсов и иных цифровых решений. Перечень услуг на сайте носит информационный характер и не заменяет индивидуальное согласование проекта."],
  ["4. Согласование заказа", "До начала работ стороны согласовывают задачу, объём, этапы, стоимость, сроки, требования к материалам и доступам, а также порядок сдачи результата. Существенные условия фиксируются в переписке или отдельном документе."],
  ["5. Акцепт и оплата", "Акцепт происходит только после согласования индивидуальных условий и оплаты счёта либо иного явно согласованного действия. Просмотр сайта или первое обращение по email сами по себе не являются акцептом. При получении оплаты Исполнитель формирует и передаёт заказчику чек НПД через сервис «Мой налог»."],
  ["6. Сроки и изменения", "Сроки зависят от согласованного объёма, своевременности предоставления материалов и обратной связи. Изменение задачи, дополнительный объём или новые интеграции согласуются сторонами отдельно до их выполнения."],
  ["7. Приёмка", "Порядок передачи и проверки результата определяется в условиях конкретного заказа. Замечания направляются в разумный срок по согласованному каналу связи; при необходимости стороны уточняют перечень доработок."],
  ["8. Права и материалы", "Права на результат, исходные файлы, доступы и материалы заказчика передаются или предоставляются в том объёме и в тот момент, которые прямо согласованы для конкретного заказа. Никакая передача исключительных прав не предполагается автоматически без отдельного соглашения."],
  ["9. Конфиденциальность и данные", "Стороны используют полученную при работе информацию только для исполнения договорённостей и соблюдают применимые требования к защите персональных данных."],
  ["10. Отказ, возврат и ответственность", "Последствия прекращения работ, возврат средств и ответственность сторон определяются с учётом фактически выполненного объёма, индивидуальных условий заказа и обязательных норм законодательства. Настоящий текст не ограничивает обязательные права потребителя."],
  ["11. Претензии и применимое право", "Вопросы и претензии направляются на vbednov921@gmail.com. К отношениям сторон применяется законодательство Российской Федерации."],
  ["12. Изменение редакции", "Актуальная редакция публикуется на сайте. Для уже согласованного заказа действует редакция и условия, зафиксированные сторонами на момент его оформления, если иное не согласовано письменно."],
];

const TODO_TEXT = "LEGAL_TODO: перед финальной публикацией подтвердить фактических провайдеров хостинга и почты, наличие cookies/аналитики, сроки хранения данных, место хранения, адрес для юридически значимых уведомлений и условия оплаты каждого типа услуг.";

function getFocusableElements(panel, brand, trigger) {
  if (!panel) return [];

  return [
    brand,
    trigger,
    ...panel.querySelectorAll('button:not([disabled]), a[href]'),
  ].filter(
    (element, index, all) =>
      element &&
      all.indexOf(element) === index &&
      element.getClientRects().length > 0 &&
      !element.hasAttribute("disabled"),
  );
}

function DocumentSections({ sections }) {
  return sections.map(([heading, text]) => (
    <section className="information-overlay__document-section" key={heading}>
      <h2>{heading}</h2>
      <p>{text}</p>
    </section>
  ));
}

function InformationContent({ overlay }) {
  if (overlay === "about") {
    return (
      <>
        <p className="information-overlay__eyebrow">// обо мне</p>
        <div className="information-overlay__copy">
          <p>Создаю цифровые продукты — от выразительного интерфейса до работающей системы. Разрабатываю сайты, веб‑приложения, Telegram‑боты, расширения и автоматизации, продумывая не только внешний вид, но и логику сценариев.</p>
          <p>Собираю проекты целиком: frontend, серверную часть, базы данных, API и интеграции со сторонними сервисами. Работаю с уведомлениями, платёжными сценариями, внутренними инструментами, контентными процессами и AI‑функциями там, где они действительно упрощают работу.</p>
          <p>Для меня важны понятная структура, аккуратная реализация, адаптивность и скорость. Технологии выбираю под задачу, а не ради самого стека.</p>
        </div>
      </>
    );
  }

  if (overlay === "stack") {
    return (
      <>
        <p className="information-overlay__eyebrow">// технологии и направления</p>
        <div className="information-overlay__copy information-overlay__copy--stack">
          <p>Рабочий стек подбирается под задачу, масштаб и срок проекта. Ниже — технологии и направления, которые использую или подключаю при необходимости.</p>
          <dl className="information-overlay__stack-list">
            {STACK_ITEMS.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </>
    );
  }

  if (overlay === "privacy-policy") {
    return (
      <>
        <p className="information-overlay__eyebrow">редакция от 12.08.2026</p>
        <div className="information-overlay__copy information-overlay__copy--document">
          <p className="information-overlay__document-intro">Политика обработки персональных данных для сайта v.build.</p>
          <DocumentSections sections={POLICY_SECTIONS} />
          <p className="information-overlay__todo">{TODO_TEXT}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="information-overlay__eyebrow">редакция от 12.08.2026</p>
      <div className="information-overlay__copy information-overlay__copy--document">
        <p className="information-overlay__document-intro">Публичная оферта о выполнении работ и оказании услуг.</p>
        <DocumentSections sections={OFFER_SECTIONS} />
        <p className="information-overlay__todo">{TODO_TEXT}</p>
      </div>
    </>
  );
}

function getOverlayTitle(overlay) {
  return overlay === "privacy-policy"
    ? "privacy policy"
    : overlay === "public-offer"
      ? "public offer"
      : overlay;
}

export function PortfolioInformationOverlay() {
  const {
    activeOverlay,
    isClosing,
    brandRef,
    menuTriggerRef,
    requestClose,
    completeClose,
  } = usePortfolioOverlay();
  const overlayRef = useRef(null);
  const hasOpenedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isOpen = isInfoOverlay(activeOverlay);
  const title = useMemo(() => (isOpen ? getOverlayTitle(activeOverlay) : ""), [activeOverlay, isOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return undefined;

      const content = overlay.querySelector(".information-overlay__content");
      gsap.killTweensOf([overlay, content]);

      if (isOpen && !isClosing) {
        hasOpenedRef.current = true;
        gsap.set(overlay, {
          autoAlpha: 1,
          pointerEvents: "auto",
          scaleY: 0,
          transformOrigin: "top center",
        });
        gsap.set(content, { autoAlpha: 0, y: reducedMotion ? 0 : 20 });

        if (reducedMotion) {
          gsap.set(content, { autoAlpha: 1, y: 0 });
          return gsap.to(overlay, { scaleY: 1, duration: 0.16, ease: "power1.out" });
        }

        return gsap
          .timeline()
          .to(overlay, { scaleY: 1, duration: 0.68, ease: "power4.inOut" })
          .to(content, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, "-=0.18");
      }

      if (!hasOpenedRef.current) {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        return undefined;
      }

      if (!isClosing) {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        return undefined;
      }

      gsap.set(overlay, { pointerEvents: "none" });
      if (reducedMotion) {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none", scaleY: 0 });
        completeClose();
        return undefined;
      }

      return gsap
        .timeline()
        .to(overlay, { scaleY: 0, duration: 0.62, ease: "power4.inOut" })
        .set(overlay, { autoAlpha: 0, pointerEvents: "none" })
        .call(completeClose);
    },
    {
      scope: overlayRef,
      dependencies: [activeOverlay, completeClose, isClosing, isOpen, reducedMotion],
    },
  );

  useEffect(() => {
    if (!isOpen || isClosing) return undefined;

    const focusDelay = window.setTimeout(
      () => menuTriggerRef.current?.focus(),
      reducedMotion ? 0 : 720,
    );

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(
        overlayRef.current,
        brandRef.current,
        menuTriggerRef.current,
      );
      if (!focusable.length) return;

      const currentIndex = focusable.indexOf(document.activeElement);
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusable.length - 1
          : currentIndex - 1
        : currentIndex === focusable.length - 1
          ? 0
          : currentIndex + 1;

      event.preventDefault();
      focusable[nextIndex].focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusDelay);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [brandRef, isClosing, isOpen, menuTriggerRef, reducedMotion, requestClose]);

  return (
    <section
      ref={overlayRef}
      className="information-overlay"
      id="portfolio-information-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="information-overlay-title"
      aria-hidden={!isOpen}
    >
      <div className="information-overlay__scroll">
        <div className="information-overlay__content">
          <h1 id="information-overlay-title">{title}</h1>
          {isOpen ? <InformationContent overlay={activeOverlay} /> : null}
        </div>
      </div>
    </section>
  );
}
