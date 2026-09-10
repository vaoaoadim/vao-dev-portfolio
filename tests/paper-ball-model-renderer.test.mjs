import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";

import { makePaperGeometry } from "../src/paperBallGeometry.js";
import {
  createPaperBallTriangles,
  drawPaperBallModel,
  projectPaperBallModel,
} from "../src/paperBallModelRenderer.js";

function createContextRecorder() {
  const calls = [];
  return {
    calls,
    beginPath() {
      calls.push("beginPath");
    },
    clearRect() {
      calls.push("clearRect");
    },
    closePath() {},
    fill() {
      calls.push("fill");
    },
    lineTo() {},
    moveTo() {},
    restore() {},
    save() {},
    stroke() {
      calls.push("stroke");
    },
    set fillStyle(value) {
      this.currentFillStyle = value;
    },
    set globalAlpha(value) {
      this.currentGlobalAlpha = value;
    },
    set lineJoin(value) {
      this.currentLineJoin = value;
    },
    set lineWidth(value) {
      this.currentLineWidth = value;
    },
    set strokeStyle(value) {
      this.currentStrokeStyle = value;
    },
  };
}

test("uses every triangle from the approved deformed Three.js geometry", () => {
  const geometry = makePaperGeometry(THREE);
  const triangles = createPaperBallTriangles(geometry);

  assert.equal(triangles.length, geometry.attributes.position.count / 3);
  assert.equal(triangles.length, 320);
  geometry.dispose();
});

test("draws the canonical faceted mesh without requiring a WebGL context", () => {
  const geometry = makePaperGeometry(THREE);
  const triangles = createPaperBallTriangles(geometry);
  const context = createContextRecorder();

  drawPaperBallModel(
    context,
    triangles,
    { exists: true, x: 180, y: 320, radius: 28, scale: 1, opacity: 0.8 },
    { x: 0.45, y: -0.25, z: 0.15 },
    0,
    360,
    640,
  );

  assert.equal(context.calls[0], "clearRect");
  assert.ok(context.calls.includes("fill"));
  assert.ok(context.calls.includes("stroke"));
  assert.equal(context.currentGlobalAlpha, 0.8);
  geometry.dispose();
});

test("projects the visible faces from the real model instead of a substitute shape", () => {
  const geometry = makePaperGeometry(THREE);
  const triangles = createPaperBallTriangles(geometry);
  const buckets = projectPaperBallModel(
    triangles,
    { x: 180, y: 320, radius: 24, scale: 1 },
    { x: 0.45, y: -0.25, z: 0.15 },
    0,
  );
  const visibleFaces = buckets.reduce(
    (total, bucket) => total + bucket.polygons.length,
    0,
  );

  assert.ok(visibleFaces > 100);
  assert.ok(visibleFaces < triangles.length);
  geometry.dispose();
});
