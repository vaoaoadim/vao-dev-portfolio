import test from "node:test";
import assert from "node:assert/strict";
import { setupSelectedWorksMascot } from "../src/selectedWorksMascotPlayback.js";

const settle = () => new Promise((resolve) => setImmediate(resolve));
const emit = (target, type) => target.dispatchEvent(new Event(type));

function fixture({
  reduced = false,
  observer = true,
  readyState = 3,
  bufferedEnd = 2,
  videoFrameCallback = false,
} = {}) {
  const window = new EventTarget();
  const document = new EventTarget();
  document.defaultView = window;
  document.hidden = false;
  window.innerHeight = 900;
  let nextAnimationFrameId = 1;
  const animationFrames = new Map();
  window.requestAnimationFrame = (callback) => {
    const id = nextAnimationFrameId;
    nextAnimationFrameId += 1;
    animationFrames.set(id, callback);
    return id;
  };
  window.cancelAnimationFrame = (id) => animationFrames.delete(id);
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
    currentTime: 0, bufferedEnd, playbackRate: 1, error: null,
    videoWidth: 660, videoHeight: 720,
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
  Object.defineProperty(video, "buffered", {
    get() {
      if (this.bufferedEnd <= 0) return { length: 0 };
      return {
        length: 1,
        start: () => 0,
        end: () => this.bufferedEnd,
      };
    },
  });
  const videoFrameCallbacks = new Map();
  let nextVideoFrameCallbackId = 1;
  if (videoFrameCallback) {
    video.requestVideoFrameCallback = (callback) => {
      const id = nextVideoFrameCallbackId;
      nextVideoFrameCallbackId += 1;
      videoFrameCallbacks.set(id, callback);
      return id;
    };
    video.cancelVideoFrameCallback = (id) => videoFrameCallbacks.delete(id);
  }
  const firstImage = {
    loading: "lazy", decodes: 0,
    decode() { this.decodes += 1; return Promise.resolve(); },
  };
  const finalImage = {
    loading: "lazy", decodes: 0,
    decode() { this.decodes += 1; return Promise.resolve(); },
  };
  const canvasDraws = [];
  const canvas = {
    width: 660,
    height: 720,
    getContext() {
      return {
        drawImage(source, ...coordinates) {
          canvasDraws.push({ source, coordinates });
        },
      };
    },
  };
  const lifecycle = {
    hasLoaded: false,
    hasStarted: false,
    hasPresentedFirstFrame: false,
    hasEnded: false,
  };
  const states = [];
  const mount = () => setupSelectedWorksMascot({
    root, video, canvas, firstImage, finalImage, lifecycle,
    onStateChange: (state) => states.push(state),
  });
  const cleanup = mount();
  return {
    window, document, motion, root, video, canvas, canvasDraws,
    firstImage, finalImage, lifecycle, states,
    observers, cleanup, mount,
    flushAnimationFrames() {
      const pending = [...animationFrames.entries()];
      animationFrames.clear();
      pending.forEach(([, callback]) => callback());
    },
    presentVideoFrame() {
      const pending = [...videoFrameCallbacks.entries()];
      videoFrameCallbacks.clear();
      pending.forEach(([, callback]) => callback());
    },
    pendingAnimationFrames() { return animationFrames.size; },
    pendingVideoFrames() { return videoFrameCallbacks.size; },
    approach() { observers[0].intersect(1); },
    enter() { observers[1].intersect(0.5); },
    leave() { observers[1].intersect(0); },
  };
}

test("near-viewport warmup retains the buffer and prepares static frames without playing", async () => {
  const f = fixture();
  assert.equal(f.video.preload, "auto");
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
  assert.equal(f.firstImage.loading, "eager");
  assert.equal(f.firstImage.decodes, 1);
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
  f.flushAnimationFrames();
  f.flushAnimationFrames();
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
  assert.equal(f.canvasDraws.at(-1)?.source, f.firstImage);
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
  assert.equal(f.video.preload, "auto");
  assert.equal(f.finalImage.decodes, 1);
  assert.equal(f.canvasDraws.at(-1)?.source, f.finalImage);
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
  const f = fixture({ observer: false, readyState: 3 });
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

test("the first static frame remains until a video frame is presented", async () => {
  const f = fixture({ videoFrameCallback: true });
  await settle();
  assert.equal(f.canvasDraws.at(-1)?.source, f.firstImage);
  f.enter();
  await settle();
  assert.equal(f.lifecycle.hasStarted, true);
  assert.equal(f.lifecycle.hasPresentedFirstFrame, false);
  assert.equal(f.pendingVideoFrames(), 1);
  f.presentVideoFrame();
  assert.equal(f.lifecycle.hasPresentedFirstFrame, true);
  assert.equal(f.canvasDraws.at(-1)?.source, f.video);
  f.presentVideoFrame();
  assert.equal(
    f.states.filter((state) => state === "hasPresentedFirstFrame").length,
    1,
  );
  f.cleanup();
});

test("initial playback waits for future data and enough buffered media", async () => {
  const f = fixture({ readyState: 2, bufferedEnd: 0.25 });
  f.enter();
  await settle();
  assert.equal(f.video.playCount, 0);
  f.video.readyState = 3;
  f.video.bufferedEnd = 0.75;
  emit(f.video, "progress");
  await settle();
  assert.equal(f.video.playCount, 0);
  f.video.bufferedEnd = 1.25;
  emit(f.video, "progress");
  await settle();
  assert.equal(f.video.playCount, 1);
  f.cleanup();
});

test("repeated media events never create a second first-frame handoff", async () => {
  const f = fixture({ videoFrameCallback: true });
  f.enter();
  await settle();
  f.presentVideoFrame();
  emit(f.video, "playing");
  emit(f.video, "canplay");
  emit(f.video, "progress");
  emit(f.document, "visibilitychange");
  assert.equal(f.pendingVideoFrames(), 1);
  assert.equal(
    f.states.filter((state) => state === "hasPresentedFirstFrame").length,
    1,
  );
  f.cleanup();
});

test("waiting and stalled retain the last canvas frame without restoring a layer", async () => {
  const f = fixture({ videoFrameCallback: true });
  await settle();
  f.enter();
  await settle();
  f.presentVideoFrame();
  const drawCount = f.canvasDraws.length;
  emit(f.video, "waiting");
  emit(f.video, "stalled");
  assert.equal(f.canvasDraws.length, drawCount);
  assert.equal(f.canvasDraws.at(-1)?.source, f.video);
  assert.equal(f.lifecycle.hasPresentedFirstFrame, true);
  f.cleanup();
});

test("ended draws the approved final image onto the same visible canvas", async () => {
  const f = fixture({ videoFrameCallback: true });
  f.enter();
  await settle();
  f.presentVideoFrame();
  f.video.finish();
  await settle();
  assert.equal(f.lifecycle.hasEnded, true);
  assert.equal(f.canvasDraws.at(-1)?.source, f.finalImage);
  assert.equal(f.pendingVideoFrames(), 0);
  f.cleanup();
});

test("cleanup cancels an unresolved first-frame callback", async () => {
  const f = fixture({ videoFrameCallback: true });
  f.enter();
  await settle();
  assert.equal(f.pendingVideoFrames(), 1);
  f.cleanup();
  assert.equal(f.pendingVideoFrames(), 0);
  assert.equal(f.lifecycle.hasPresentedFirstFrame, false);
});

test("cleanup cancels the RAF renderer when video-frame callbacks are unavailable", async () => {
  const f = fixture();
  f.enter();
  await settle();
  assert.equal(f.pendingAnimationFrames(), 1);
  f.cleanup();
  assert.equal(f.pendingAnimationFrames(), 0);
  assert.equal(f.lifecycle.hasPresentedFirstFrame, false);
});

test("cleanup prevents late promises and events from updating an unmounted component", async () => {
  const f = fixture();
  f.states.length = 0;
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
