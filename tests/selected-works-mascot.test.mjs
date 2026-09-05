import test from "node:test";
import assert from "node:assert/strict";
import { setupSelectedWorksMascot } from "../src/selectedWorksMascotPlayback.js";

const settle = () => new Promise((resolve) => setImmediate(resolve));
const emit = (target, type) => target.dispatchEvent(new Event(type));

function fixture({ reduced = false, observer = true, readyState = 0 } = {}) {
  const window = new EventTarget();
  const document = new EventTarget();
  document.defaultView = window;
  document.hidden = false;
  window.innerHeight = 900;
  const motion = new EventTarget();
  motion.matches = reduced;
  window.matchMedia = () => motion;
  const observers = [];
  if (observer) {
    window.IntersectionObserver = class {
      constructor(callback, options) {
        Object.assign(this, { callback, options, disconnected: false });
        observers.push(this);
      }
      observe() {}
      disconnect() { this.disconnected = true; }
      intersect(ratio) {
        if (!this.disconnected) {
          this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]);
        }
      }
    };
  }
  const root = {
    ownerDocument: document,
    bounds: { top: 3000, bottom: 3300 },
    getBoundingClientRect() { return this.bounds; },
  };
  const video = Object.assign(new EventTarget(), {
    preload: "metadata", paused: true, ended: false, readyState,
    currentTime: 0, playbackRate: 1, error: null,
    playCount: 0, loadCount: 0, playResults: [],
    load() { this.loadCount += 1; this.currentTime = 0; },
    async play() {
      this.playCount += 1;
      const result = this.playResults.shift();
      if (result instanceof Error) throw result;
      if (result) await result;
      this.paused = false;
      emit(this, "playing");
    },
    pause() { this.paused = true; emit(this, "pause"); },
    finish() { this.paused = true; this.ended = true; emit(this, "ended"); },
  });
  const finalImage = {
    loading: "lazy", decodes: 0,
    decode() { this.decodes += 1; return Promise.resolve(); },
  };
  const lifecycle = { hasLoaded: false, hasStarted: false, hasEnded: false };
  const states = [];
  const mount = () => setupSelectedWorksMascot({
    root, video, finalImage, lifecycle, onStateChange: (state) => states.push(state),
  });
  const cleanup = mount();
  return {
    window, document, motion, root, video, finalImage, lifecycle, states,
    observers, cleanup, mount,
    approach() { observers[0].intersect(1); },
    enter() { observers[1].intersect(0.5); },
    leave() { observers[1].intersect(0); },
  };
}

test("near-viewport warmup retains the buffer and prepares the final frame without playing", async () => {
  const f = fixture();
  assert.equal(f.video.preload, "metadata");
  assert.equal(f.finalImage.decodes, 0);
  f.video.currentTime = 0.25;
  f.approach();
  await settle();
  assert.equal(f.video.preload, "auto");
  assert.equal(f.video.loadCount, 0);
  assert.equal(f.video.currentTime, 0.25);
  assert.equal(f.video.playCount, 0);
  assert.equal(f.finalImage.loading, "eager");
  assert.equal(f.finalImage.decodes, 1);
  f.observers[1].intersect(0.1);
  assert.equal(f.video.playCount, 0);
  f.enter();
  await settle();
  assert.equal(f.video.playCount, 1);
  assert.equal(f.video.playbackRate, 1);
  assert.equal(f.lifecycle.hasStarted, true);
  assert.equal(f.finalImage.decodes, 1);
  f.cleanup();
});

test("a slow play promise is not duplicated by visibility, canplay or scrolling", async () => {
  const f = fixture();
  let resolvePlay;
  f.video.playResults.push(new Promise((resolve) => { resolvePlay = resolve; }));
  f.enter();
  emit(f.video, "canplay");
  emit(f.document, "visibilitychange");
  f.leave();
  f.enter();
  assert.equal(f.video.playCount, 1);
  resolvePlay();
  await settle();
  assert.equal(f.lifecycle.hasStarted, true);
  f.cleanup();
});

test("returning to a browser-paused clip resumes its timestamp without replaying the start", async () => {
  const f = fixture();
  f.enter();
  await settle();
  f.video.currentTime = 1.2;
  f.document.hidden = true;
  f.video.pause();
  emit(f.document, "visibilitychange");
  assert.equal(f.video.playCount, 1);
  f.document.hidden = false;
  emit(f.document, "visibilitychange");
  await settle();
  assert.equal(f.video.playCount, 2);
  assert.equal(f.video.currentTime, 1.2);
  f.leave();
  f.video.pause();
  emit(f.video, "canplay");
  assert.equal(f.video.playCount, 2);
  f.enter();
  await settle();
  assert.equal(f.video.playCount, 3);
  assert.equal(f.video.currentTime, 1.2);
  assert.equal(f.video.loadCount, 0);
  f.cleanup();
});

test("scrolling away does not pause a running clip and completion never replays it", async () => {
  const f = fixture();
  f.enter();
  await settle();
  f.leave();
  assert.equal(f.video.paused, false);
  f.video.finish();
  f.enter();
  emit(f.window, "pageshow");
  emit(f.document, "visibilitychange");
  emit(f.window, "pointerdown");
  emit(f.video, "canplay");
  await settle();
  assert.equal(f.lifecycle.hasEnded, true);
  assert.equal(f.video.playCount, 1);
  assert.ok(f.observers.every((entry) => entry.disconnected));
  f.cleanup();
  const cleanup = f.mount();
  emit(f.window, "pageshow");
  assert.equal(f.video.playCount, 1);
  cleanup();
});

test("autoplay rejection allows later user retries without an automatic retry loop", async () => {
  const f = fixture();
  f.video.playResults.push(
    new DOMException("blocked", "NotAllowedError"),
    new DOMException("still blocked", "NotAllowedError"),
  );
  f.enter();
  await settle();
  emit(f.video, "canplay");
  emit(f.window, "pageshow");
  assert.equal(f.video.playCount, 1);
  f.leave();
  emit(f.window, "pointerdown");
  assert.equal(f.video.playCount, 1);
  f.enter();
  emit(f.window, "pointerdown");
  await settle();
  assert.equal(f.video.playCount, 2);
  emit(f.window, "keydown");
  await settle();
  assert.equal(f.video.playCount, 3);
  assert.equal(f.lifecycle.hasStarted, true);
  emit(f.window, "pointerdown");
  assert.equal(f.video.playCount, 3);
  f.cleanup();
});

test("an interrupted initial attempt can recover on canplay", async () => {
  const f = fixture();
  f.video.playResults.push(new DOMException("interrupted", "AbortError"));
  f.enter();
  await settle();
  emit(f.video, "canplay");
  await settle();
  assert.equal(f.lifecycle.hasStarted, true);
  assert.equal(f.video.playCount, 2);
  f.cleanup();
});

test("reduced motion displays the static asset without starting video", async () => {
  const f = fixture({ reduced: true });
  f.approach();
  f.enter();
  emit(f.window, "pointerdown");
  await settle();
  assert.equal(f.video.playCount, 0);
  assert.equal(f.video.preload, "metadata");
  assert.equal(f.finalImage.decodes, 1);
  f.motion.matches = false;
  emit(f.motion, "change");
  await settle();
  assert.equal(f.video.playCount, 1);
  f.motion.matches = true;
  emit(f.motion, "change");
  assert.equal(f.video.paused, true);
  f.cleanup();
});

test("fallback visibility and cached loadeddata still work without IntersectionObserver", async () => {
  const f = fixture({ observer: false, readyState: 2 });
  assert.equal(f.lifecycle.hasLoaded, true);
  f.root.bounds = { top: 1300, bottom: 1600 };
  emit(f.window, "scroll");
  assert.equal(f.video.preload, "auto");
  assert.equal(f.video.playCount, 0);
  f.root.bounds = { top: 300, bottom: 600 };
  emit(f.window, "scroll");
  await settle();
  assert.equal(f.video.playCount, 1);
  f.video.finish();
  emit(f.window, "scroll");
  assert.equal(f.video.playCount, 1);
  f.cleanup();
});

test("cleanup prevents late promises and events from updating an unmounted component", async () => {
  const f = fixture();
  let resolvePlay;
  f.video.playResults.push(new Promise((resolve) => { resolvePlay = resolve; }));
  f.enter();
  f.cleanup();
  resolvePlay();
  await settle();
  emit(f.video, "loadeddata");
  emit(f.video, "ended");
  emit(f.window, "pointerdown");
  emit(f.window, "pageshow");
  emit(f.document, "visibilitychange");
  assert.deepEqual(f.states, []);
  assert.equal(f.video.playCount, 1);
});
