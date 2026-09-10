import assert from "node:assert/strict";
import test from "node:test";
import { drawPaperBallFallback } from "../src/paperBallFallback.js";

function createContext() {
  const calls = [];
  const context = { calls };
  [
    "clearRect",
    "save",
    "translate",
    "rotate",
    "beginPath",
    "moveTo",
    "lineTo",
    "closePath",
    "fill",
    "stroke",
    "restore",
  ].forEach((name) => {
    context[name] = (...args) => calls.push([name, ...args]);
  });
  return context;
}

test("fallback keeps the canvas empty while no paper ball exists", () => {
  const context = createContext();
  drawPaperBallFallback(context, { exists: false }, { width: 390, height: 844 });
  assert.deepEqual(context.calls, [["clearRect", 0, 0, 390, 844]]);
});

test("fallback draws a complete faceted paper ball when WebGL is unavailable", () => {
  const context = createContext();
  drawPaperBallFallback(
    context,
    {
      exists: true,
      x: 120,
      y: 240,
      radius: 24,
      scale: 1,
      opacity: 0.8,
      angularY: 2,
    },
    { width: 390, height: 844 },
  );

  assert.deepEqual(context.calls[0], ["clearRect", 0, 0, 390, 844]);
  assert.equal(context.calls.filter(([name]) => name === "fill").length, 10);
  assert.equal(context.calls.filter(([name]) => name === "stroke").length, 1);
  assert.deepEqual(context.calls.at(-1), ["restore"]);
  assert.equal(context.globalAlpha, 0.8);
});
