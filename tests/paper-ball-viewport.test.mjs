import assert from "node:assert/strict";
import test from "node:test";

import { getPaperBallViewport } from "../src/paperBallViewport.js";

test("limits a tall mobile build scene to one viewport-sized canvas", () => {
  const viewport = getPaperBallViewport({
    sectionTop: -1280,
    sectionHeight: 3600,
    viewportHeight: 844,
  });

  assert.deepEqual(viewport, {
    top: 1280,
    height: 844,
    bottom: 2124,
  });
});

test("pins the renderer window inside the start and end of the section", () => {
  assert.deepEqual(
    getPaperBallViewport({
      sectionTop: 240,
      sectionHeight: 3600,
      viewportHeight: 844,
    }),
    { top: 0, height: 844, bottom: 844 },
  );

  assert.deepEqual(
    getPaperBallViewport({
      sectionTop: -3400,
      sectionHeight: 3600,
      viewportHeight: 844,
    }),
    { top: 2756, height: 844, bottom: 3600 },
  );
});

test("uses the full height when the section is shorter than the viewport", () => {
  assert.deepEqual(
    getPaperBallViewport({
      sectionTop: 0,
      sectionHeight: 620,
      viewportHeight: 844,
    }),
    { top: 0, height: 620, bottom: 620 },
  );
});
