#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chromeCandidates = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const browserPath = chromeCandidates.find(existsSync);
const port = 9224;
const baseUrl = "http://127.0.0.1:4173/";
const profilePath = path.join(root, "dist", "qa", "chrome-profile");
const screenshotPath = path.join(root, "dist", "qa", "screenshots");

const viewports = [
  [360, 800],
  [390, 844],
  [430, 932],
  [768, 1024],
  [820, 1180],
  [1024, 1366],
  [1024, 768],
  [1180, 820],
  [1440, 900],
  [1920, 1080],
];

if (!browserPath) {
  throw new Error("Chrome or Edge is required for responsive verification.");
}

mkdirSync(profilePath, { recursive: true });
mkdirSync(screenshotPath, { recursive: true });

const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profilePath}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error("Chrome DevTools endpoint did not become available.");
}

async function createPage() {
  const response = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(baseUrl)}`,
    { method: "PUT" },
  );
  if (!response.ok) throw new Error("Unable to create the QA browser page.");
  return response.json();
}

function createCdpClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let commandId = 0;
  const pending = new Map();

  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  return {
    ready,
    close: () => socket.close(),
    send(method, params = {}) {
      commandId += 1;
      return new Promise((resolve, reject) => {
        pending.set(commandId, { resolve, reject });
        socket.send(JSON.stringify({ id: commandId, method, params }));
      });
    },
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Runtime evaluation failed.");
  }
  return result.result.value;
}

async function waitForDocument(client) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ready = await evaluate(client, "document.readyState === 'complete'");
    if (ready) return;
    await delay(50);
  }
  throw new Error("The QA page did not finish loading.");
}

function shouldCapture(width, height) {
  return ["390x844", "820x1180", "1180x820", "1440x900"].includes(
    `${width}x${height}`,
  );
}

const results = [];
let client;

try {
  await waitForDebugger();
  const page = await createPage();
  client = createCdpClient(page.webSocketDebuggerUrl);
  await client.ready;
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  for (const [width, height] of viewports) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width <= 430,
      screenOrientation:
        height > width
          ? { type: "portraitPrimary", angle: 0 }
          : { type: "landscapePrimary", angle: 90 },
    });

    for (const theme of ["light", "dark"]) {
      await client.send("Page.navigate", { url: baseUrl });
      await waitForDocument(client);
      await evaluate(
        client,
        `localStorage.setItem('vao.theme', '${theme}'); location.reload();`,
      );
      await waitForDocument(client);
      await delay(theme === "dark" ? 250 : 100);

      const metrics = await evaluate(
        client,
        `(() => {
          const scene = document.querySelector('.theme-scene[data-active="true"] img');
          const toggle = document.querySelector('.theme-toggle');
          const rect = toggle.getBoundingClientRect();
          return {
            theme: document.documentElement.dataset.theme,
            savedTheme: localStorage.getItem('vao.theme'),
            currentSource: scene.currentSrc.split('/').pop(),
            naturalWidth: scene.naturalWidth,
            naturalHeight: scene.naturalHeight,
            sceneFit: getComputedStyle(scene).objectFit,
            toggleWidth: rect.width,
            toggleHeight: rect.height,
            toggleInsideViewport:
              rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
            ariaLabel: toggle.getAttribute('aria-label'),
            horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
            verticalOverflow: document.documentElement.scrollHeight > innerHeight,
          };
        })()`,
      );

      const expectedOrientation = height > width ? "portrait" : "landscape";
      const expectedDimensions =
        expectedOrientation === "portrait" ? [941, 1672] : [1672, 941];
      const passed =
        metrics.theme === theme &&
        metrics.savedTheme === theme &&
        metrics.currentSource.includes(expectedOrientation) &&
        metrics.naturalWidth === expectedDimensions[0] &&
        metrics.naturalHeight === expectedDimensions[1] &&
        metrics.sceneFit === "contain" &&
        metrics.toggleWidth >= 48 &&
        metrics.toggleHeight >= 48 &&
        metrics.toggleInsideViewport &&
        !metrics.horizontalOverflow &&
        !metrics.verticalOverflow;

      results.push({ viewport: `${width}x${height}`, expectedOrientation, passed, ...metrics });

      if (shouldCapture(width, height)) {
        const screenshot = await client.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          captureBeyondViewport: false,
        });
        writeFileSync(
          path.join(screenshotPath, `${width}x${height}-${theme}.png`),
          Buffer.from(screenshot.data, "base64"),
        );
      }
    }
  }

  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await delay(120);
  const reducedMotion = await evaluate(
    client,
    `(() => {
      const scene = document.querySelector('.theme-scene');
      const icon = document.querySelector('.theme-icon-sun');
      return {
        requested: matchMedia('(prefers-reduced-motion: reduce)').matches,
        sceneDuration: getComputedStyle(scene).transitionDuration,
        iconTransform: getComputedStyle(icon).transform,
      };
    })()`,
  );

  await client.send("Emulation.setEmulatedMedia", { features: [] });
  await client.send("Page.navigate", { url: baseUrl });
  await waitForDocument(client);
  await evaluate(
    client,
    "localStorage.setItem('vao.theme', 'light'); location.reload();",
  );
  await waitForDocument(client);
  const focusCheck = await evaluate(
    client,
    `(() => {
      const toggle = document.querySelector('.theme-toggle');
      toggle.focus();
      const focusedBefore = document.activeElement === toggle;
      toggle.click();
      return new Promise((resolve) => setTimeout(() => resolve({
        focusedBefore,
        focusedAfter: document.activeElement === toggle,
        themeAfterClick: document.documentElement.dataset.theme,
        ariaBusyAfterClick: toggle.getAttribute('aria-busy'),
      }), 600));
    })()`,
  );

  await evaluate(client, "localStorage.clear(); location.reload();");
  await waitForDocument(client);
  const firstVisitTheme = await evaluate(
    client,
    "document.documentElement.dataset.theme",
  );

  const failures = results.filter(({ passed }) => !passed);
  console.log(
    JSON.stringify(
      {
        browser: browserPath,
        checkedStates: results.length,
        failures,
        reducedMotion,
        focusCheck,
        firstVisitTheme,
        screenshots: screenshotPath,
      },
      null,
      2,
    ),
  );

  if (
    failures.length > 0 ||
    !reducedMotion.requested ||
    !reducedMotion.sceneDuration.startsWith("0.08s") ||
    reducedMotion.iconTransform !== "none" ||
    !focusCheck.focusedBefore ||
    !focusCheck.focusedAfter ||
    focusCheck.themeAfterClick !== "dark" ||
    focusCheck.ariaBusyAfterClick !== "false" ||
    firstVisitTheme !== "light"
  ) {
    process.exitCode = 1;
  }
} finally {
  client?.close();
  if (browser.pid) {
    browser.kill();
  }
}
