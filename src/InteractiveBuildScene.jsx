import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageContext";
import { drawPaperBallFallback } from "./paperBallFallback";

// The office is a single flattened PNG. These normalized anchors target its
// intrinsic image area, so every overlay follows the existing responsive image.
export const BUILD_SCENE_ANCHORS = {
  boardSurface: { x: 0.5846, y: 0.1668, width: 0.359, height: 0.269 },
  marker: { x: 0.789, y: 0.752, width: 0.112, height: 0.055 },
  bin: { x: 0.546, y: 0.638, width: 0.132, height: 0.184 },
  binMouth: { x: 0.552, y: 0.638, width: 0.116, height: 0.047 },
  floorY: 0.9,
};

export const PAPER_BALL_CONFIG = {
  diameter: {
    desktop: 62,
    tablet: 54,
    mobile: 48,
  },
  physics: {
    gravity: 1320,
    spawnVelocityX: 175,
    spawnVelocityY: -430,
    restitution: 0.46,
    floorFriction: 0.76,
    airDamping: 0.997,
    throwMultiplier: 1.08,
    maxThrowSpeed: 1680,
    floorGap: 34,
  },
};

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

function rectFromAnchor(imageRect, sectionRect, anchor) {
  return {
    left: imageRect.left - sectionRect.left + imageRect.width * anchor.x,
    top: imageRect.top - sectionRect.top + imageRect.height * anchor.y,
    width: imageRect.width * anchor.width,
    height: imageRect.height * anchor.height,
  };
}

function expandRect(rect, minimumSize) {
  const width = Math.max(rect.width, minimumSize);
  const height = Math.max(rect.height, minimumSize);

  return {
    left: rect.left - (width - rect.width) / 2,
    top: rect.top - (height - rect.height) / 2,
    width,
    height,
  };
}

function placeRect(element, rect) {
  if (!element) return;
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
}

function getBallDiameter(width, binRect) {
  const preferredDiameter =
    width <= 760
      ? clamp(width * 0.11, 26, PAPER_BALL_CONFIG.diameter.mobile)
      : width <= 1100
        ? PAPER_BALL_CONFIG.diameter.tablet
        : PAPER_BALL_CONFIG.diameter.desktop;
  const binCap = binRect ? Math.max(18, binRect.width * 0.78) : preferredDiameter;

  return Math.min(preferredDiameter, binCap);
}

function makePaperGeometry(three) {
  const baseGeometry = new three.IcosahedronGeometry(1, 3);
  const geometry = baseGeometry.index ? baseGeometry.toNonIndexed() : baseGeometry;
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const length = Math.hypot(x, y, z) || 1;
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    const crease =
      Math.sin(nx * 17.31 + ny * 8.47) * 0.035 +
      Math.sin(ny * 23.17 + nz * 12.83) * 0.026 +
      Math.sin(nz * 29.03 + nx * 9.19) * 0.021;
    const broadFold = Math.sin((nx + ny - nz) * 7.4) * 0.045;
    const radius = 1 + crease + broadFold;

    positions.setXYZ(index, nx * radius, ny * radius, nz * radius);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function HintArrow({ direction = "down" }) {
  return (
    <svg className={`scene-hint-chevron scene-hint-chevron--${direction}`} viewBox="0 0 16 12" aria-hidden="true">
      <path d="M3 3 L8 8 L13 3" />
    </svg>
  );
}

export function InteractiveBuildScene({ sectionRef, imageRef }) {
  const { copy } = useLanguage();
  const layerRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const fallbackCanvasRef = useRef(null);
  const markerButtonRef = useRef(null);
  const binButtonRef = useRef(null);
  const ballProxyRef = useRef(null);
  const clearButtonRef = useRef(null);
  const focusDismissRef = useRef(null);
  const focusCloseButtonRef = useRef(null);
  const markerHintRef = useRef(null);
  const binHintRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    const section = sectionRef.current;
    const image = imageRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const threeCanvas = threeCanvasRef.current;
    const fallbackCanvas = fallbackCanvasRef.current;
    const markerButton = markerButtonRef.current;
    const binButton = binButtonRef.current;
    const ballProxy = ballProxyRef.current;
    const clearButton = clearButtonRef.current;
    const focusDismiss = focusDismissRef.current;
    const focusCloseButton = focusCloseButtonRef.current;
    const markerHint = markerHintRef.current;
    const binHint = binHintRef.current;

    if (
      !layer ||
      !section ||
      !image ||
      !drawingCanvas ||
      !threeCanvas ||
      !fallbackCanvas ||
      !markerButton ||
      !binButton ||
      !ballProxy ||
      !clearButton ||
      !focusDismiss ||
      !focusCloseButton ||
      !markerHint ||
      !binHint
    ) {
      return undefined;
    }

    delete layer.dataset.drawingActive;
    clearButton.hidden = true;
    focusCloseButton.hidden = true;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const drawingContext = drawingCanvas.getContext("2d");
    const paperFallbackContext = fallbackCanvas.getContext("2d");
    const strokes = [];
    const anchors = {
      board: null,
      marker: null,
      bin: null,
      mouth: null,
    };
    let drawingActive = false;
    let boardFocused = false;
    let drawingPointerId = null;
    let suppressMarkerClickUntil = 0;
    let activeStroke = null;
    let layoutFrame = 0;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let renderer = null;
    let scene = null;
    let camera = null;
    let paperMesh = null;
    let paperGeometry = null;
    let paperMaterial = null;
    let paperFallbackActive = false;
    let threeLoadPromise = null;
    let sceneObserver = null;
    let isSceneNearViewport = false;
    let isDisposed = false;
    let hasQueuedBall = false;
    let rendererWidth = 0;
    let rendererHeight = 0;
    let rendererPixelRatio = 0;

    const world = {
      width: 1,
      height: 1,
      floor: 1,
      pixelRatio: 1,
    };

    const ball = {
      exists: false,
      dragging: false,
      sleeping: false,
      sinking: false,
      pointerId: null,
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      velocityX: 0,
      velocityY: 0,
      angularX: 0,
      angularY: 0,
      radius: PAPER_BALL_CONFIG.diameter.desktop / 2,
      scale: 1,
      opacity: 1,
      phaseTime: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      samples: [],
    };

    const drawStoredStrokes = () => {
      if (!drawingContext) return;
      const rect = drawingCanvas.getBoundingClientRect();
      drawingContext.clearRect(0, 0, rect.width, rect.height);
      drawingContext.strokeStyle = "#191919";
      drawingContext.lineWidth = 3;
      drawingContext.lineCap = "round";
      drawingContext.lineJoin = "round";

      strokes.forEach((stroke) => {
        if (!stroke.length) return;
        drawingContext.beginPath();
        drawingContext.moveTo(stroke[0].x * rect.width, stroke[0].y * rect.height);
        stroke.slice(1).forEach((point) => {
          drawingContext.lineTo(point.x * rect.width, point.y * rect.height);
        });

        if (stroke.length === 1) {
          drawingContext.lineTo(
            stroke[0].x * rect.width + 0.01,
            stroke[0].y * rect.height + 0.01,
          );
        }
        drawingContext.stroke();
      });
    };

    const resizeDrawingCanvas = () => {
      if (!drawingContext) return;
      const rect = drawingCanvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));

      if (drawingCanvas.width !== width || drawingCanvas.height !== height) {
        drawingCanvas.width = width;
        drawingCanvas.height = height;
        drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        drawStoredStrokes();
      }
    };

    const renderFallbackPaper = () => {
      if (!paperFallbackContext || !paperFallbackActive) return;
      drawPaperBallFallback(paperFallbackContext, ball, world);
    };

    const renderPaper = () => {
      const hasThreeRenderer = renderer && scene && camera && paperMesh;
      if (!hasThreeRenderer && !paperFallbackActive) return;

      if (hasThreeRenderer) {
        paperMesh.visible = ball.exists;
        paperMesh.position.set(ball.x, ball.y, 0);
        paperMesh.scale.setScalar(ball.radius * ball.scale);
        paperMaterial.opacity = ball.opacity;
      }

      if (ball.exists) {
        const proxySize = Math.max(ball.radius * 2 + 14, 52);
        ballProxy.style.width = `${proxySize}px`;
        ballProxy.style.height = `${proxySize}px`;
        ballProxy.style.transform = `translate3d(${ball.x - proxySize / 2}px, ${
          ball.y - proxySize / 2
        }px, 0)`;
      }

      if (hasThreeRenderer) {
        renderer.render(scene, camera);
      } else {
        renderFallbackPaper();
      }
    };

    const resizeThreeScene = () => {
      const nextWidth = Math.max(1, section.clientWidth);
      const nextHeight = Math.max(1, section.clientHeight);
      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      world.width = nextWidth;
      world.height = nextHeight;
      world.pixelRatio = nextPixelRatio;
      const visibleSectionHeight = Math.min(
        world.height,
        Math.max(window.innerHeight, 1),
      );
      const imageFloor = anchors.mouth
        ? image.getBoundingClientRect().top - section.getBoundingClientRect().top +
          image.getBoundingClientRect().height * BUILD_SCENE_ANCHORS.floorY
        : 0;
      world.floor = Math.min(
        world.height - PAPER_BALL_CONFIG.physics.floorGap,
        Math.max(
          imageFloor,
          visibleSectionHeight - PAPER_BALL_CONFIG.physics.floorGap,
        ),
      );

      if (
        renderer &&
        camera &&
        (rendererWidth !== world.width ||
          rendererHeight !== world.height ||
          rendererPixelRatio !== world.pixelRatio)
      ) {
        renderer.setPixelRatio(world.pixelRatio);
        renderer.setSize(world.width, world.height, false);
        camera.left = 0;
        camera.right = world.width;
        camera.top = 0;
        camera.bottom = world.height;
        camera.updateProjectionMatrix();
        rendererWidth = world.width;
        rendererHeight = world.height;
        rendererPixelRatio = world.pixelRatio;
      }

      if (
        paperFallbackContext &&
        (fallbackCanvas.width !== Math.round(world.width * world.pixelRatio) ||
          fallbackCanvas.height !== Math.round(world.height * world.pixelRatio))
      ) {
        fallbackCanvas.width = Math.max(1, Math.round(world.width * world.pixelRatio));
        fallbackCanvas.height = Math.max(1, Math.round(world.height * world.pixelRatio));
        paperFallbackContext.setTransform(
          world.pixelRatio,
          0,
          0,
          world.pixelRatio,
          0,
          0,
        );
      }

      if (ball.exists) {
        ball.radius = getBallDiameter(world.width, anchors.bin) / 2;
        ball.x = clamp(ball.x, ball.radius, world.width - ball.radius);
        ball.y = clamp(ball.y, ball.radius, world.floor - ball.radius);
      }
      renderPaper();
    };

    const getFocusedBoardRect = (sectionRect) => {
      const viewportWidth = Math.max(window.innerWidth, 320);
      const viewportHeight = Math.max(window.innerHeight, 480);
      const width = Math.min(viewportWidth * 0.88, 560);
      const height = width * (BUILD_SCENE_ANCHORS.boardSurface.height / BUILD_SCENE_ANCHORS.boardSurface.width);

      return {
        left: (viewportWidth - width) / 2 - sectionRect.left,
        top: (viewportHeight - height) / 2 - sectionRect.top,
        width,
        height,
      };
    };

    const updateLayout = () => {
      layoutFrame = 0;
      const sectionRect = section.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();

      anchors.board = rectFromAnchor(
        imageRect,
        sectionRect,
        BUILD_SCENE_ANCHORS.boardSurface,
      );
      anchors.marker = rectFromAnchor(
        imageRect,
        sectionRect,
        BUILD_SCENE_ANCHORS.marker,
      );
      anchors.bin = rectFromAnchor(
        imageRect,
        sectionRect,
        BUILD_SCENE_ANCHORS.bin,
      );
      anchors.mouth = rectFromAnchor(
        imageRect,
        sectionRect,
        BUILD_SCENE_ANCHORS.binMouth,
      );

      const activeBoardRect = boardFocused
        ? getFocusedBoardRect(sectionRect)
        : anchors.board;
      const minimumTarget = coarsePointerQuery.matches ? 48 : 36;
      placeRect(drawingCanvas, activeBoardRect);
      placeRect(markerButton, expandRect(anchors.marker, minimumTarget));
      placeRect(binButton, expandRect(anchors.bin, Math.max(48, minimumTarget)));

      markerHint.style.left = `${clamp(
        anchors.marker.left + anchors.marker.width / 2,
        36,
        section.clientWidth - 36,
      )}px`;
      markerHint.style.top = `${anchors.marker.top - 48}px`;
      binHint.style.left = `${clamp(
        anchors.bin.left + anchors.bin.width / 2,
        36,
        section.clientWidth - 36,
      )}px`;
      binHint.style.top = `${anchors.bin.top + anchors.bin.height + 4}px`;

      const clearWidth = 74;
      clearButton.style.left = `${Math.min(
        section.clientWidth - clearWidth - 8,
        activeBoardRect.left + activeBoardRect.width - clearWidth,
      )}px`;
      clearButton.style.top = `${activeBoardRect.top + activeBoardRect.height + 6}px`;

      const closeButtonSize = 44;
      focusCloseButton.style.left = `${Math.max(
        0,
        Math.min(
          section.clientWidth - closeButtonSize,
          activeBoardRect.left + activeBoardRect.width - closeButtonSize,
        ),
      )}px`;
      focusCloseButton.style.top = `${Math.max(0, activeBoardRect.top - closeButtonSize)}px`;

      resizeDrawingCanvas();
      resizeThreeScene();
    };

    const requestLayout = () => {
      if (!isSceneNearViewport) return;
      if (layoutFrame) return;
      layoutFrame = window.requestAnimationFrame(updateLayout);
    };

    const removeBall = () => {
      ball.exists = false;
      ball.dragging = false;
      ball.sleeping = false;
      ball.sinking = false;
      ball.pointerId = null;
      ball.samples.length = 0;
      if (paperMesh) paperMesh.visible = false;
      ballProxy.hidden = true;
      binButton.removeAttribute("aria-disabled");
      binHint.classList.remove("is-hidden");
      renderPaper();
    };

    const startAnimation = () => {
      if (animationFrame) return;
      lastFrameTime = performance.now();
      animationFrame = window.requestAnimationFrame(animate);
    };

    const triggerBinSuccess = () => {
      ball.sinking = true;
      ball.dragging = false;
      ball.phaseTime = 0;
      ball.velocityX = 0;
      ball.velocityY = 0;
      ball.angularX *= 0.35;
      ball.angularY *= 0.35;
    };

    function animate(time) {
      animationFrame = 0;
      if (!ball.exists) return;

      const delta = Math.min(Math.max((time - lastFrameTime) / 1000, 0), 1 / 30);
      lastFrameTime = time;
      const physics = PAPER_BALL_CONFIG.physics;

      if (ball.sinking) {
        ball.phaseTime += delta;
        const duration = reducedMotionQuery.matches ? 0.14 : 0.26;
        const progress = clamp(ball.phaseTime / duration, 0, 1);
        const targetX = anchors.mouth.left + anchors.mouth.width / 2;
        ball.x += (targetX - ball.x) * Math.min(1, delta * 16);
        ball.y += (anchors.mouth.top + anchors.mouth.height * 1.7 - ball.y) *
          Math.min(1, delta * 14);
        ball.scale = 1 - progress * 0.8;
        ball.opacity = 1 - progress;

        if (progress >= 1) {
          removeBall();
          return;
        }
      } else if (!ball.dragging && !ball.sleeping) {
        ball.previousX = ball.x;
        ball.previousY = ball.y;
        ball.velocityY += physics.gravity * delta;
        const damping = Math.pow(physics.airDamping, delta * 60);
        ball.velocityX *= damping;
        ball.velocityY *= damping;
        ball.x += ball.velocityX * delta;
        ball.y += ball.velocityY * delta;

        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.velocityX = Math.abs(ball.velocityX) * physics.restitution;
        } else if (ball.x + ball.radius > world.width) {
          ball.x = world.width - ball.radius;
          ball.velocityX = -Math.abs(ball.velocityX) * physics.restitution;
        }

        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.velocityY = Math.abs(ball.velocityY) * physics.restitution;
        }

        const mouthInset = Math.min(anchors.mouth.width * 0.2, ball.radius * 0.35);
        const crossesMouth =
          ball.velocityY > 0 &&
          ball.previousY <= anchors.mouth.top &&
          ball.y >= anchors.mouth.top &&
          ball.x >= anchors.mouth.left + mouthInset &&
          ball.x <= anchors.mouth.left + anchors.mouth.width - mouthInset;

        if (crossesMouth) {
          triggerBinSuccess();
        } else if (ball.y + ball.radius > world.floor) {
          ball.y = world.floor - ball.radius;
          if (Math.abs(ball.velocityY) > 36) {
            ball.velocityY = -Math.abs(ball.velocityY) * physics.restitution;
          } else {
            ball.velocityY = 0;
          }
          ball.velocityX *= physics.floorFriction;

          if (Math.abs(ball.velocityX) < 7 && Math.abs(ball.velocityY) < 7) {
            ball.velocityX = 0;
            ball.velocityY = 0;
            ball.sleeping = true;
          }
        }

        if (paperMesh) {
          paperMesh.rotation.x += ball.angularX * delta;
          paperMesh.rotation.y += ball.angularY * delta;
        }

        if (ball.scale < 1 || ball.opacity < 1) {
          ball.phaseTime += delta;
          const appearProgress = clamp(ball.phaseTime / 0.18, 0, 1);
          ball.scale = 0.6 + appearProgress * 0.4;
          ball.opacity = appearProgress;
        }
      } else if (ball.dragging) {
        if (paperMesh) {
          paperMesh.rotation.x += ball.angularX * delta;
          paperMesh.rotation.y += ball.angularY * delta;
        }
      }

      renderPaper();

      if (ball.exists && (!ball.sleeping || ball.dragging || ball.sinking)) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    const spawnBall = () => {
      if (ball.exists) return;
      if (!anchors.mouth) updateLayout();
      if (!anchors.mouth) return;
      if (!renderer && !paperFallbackActive) {
        hasQueuedBall = true;
        void initializeThree();
        return;
      }

      ball.exists = true;
      ball.sleeping = false;
      ball.sinking = false;
      ball.dragging = false;
      ball.pointerId = null;
      ball.radius = getBallDiameter(world.width, anchors.bin) / 2;
      ball.x = anchors.mouth.left + anchors.mouth.width / 2;
      ball.y = anchors.mouth.top + anchors.mouth.height * 0.55;
      ball.previousX = ball.x;
      ball.previousY = ball.y;
      ball.velocityX = reducedMotionQuery.matches
        ? 42
        : PAPER_BALL_CONFIG.physics.spawnVelocityX;
      ball.velocityY = reducedMotionQuery.matches
        ? -90
        : PAPER_BALL_CONFIG.physics.spawnVelocityY;
      ball.angularX = reducedMotionQuery.matches ? 0.5 : 3.6;
      ball.angularY = reducedMotionQuery.matches ? 0.35 : 4.8;
      ball.scale = reducedMotionQuery.matches ? 0.9 : 0.6;
      ball.opacity = 0;
      ball.phaseTime = 0;
      paperMesh?.rotation.set(0.45, -0.25, 0.15);
      if (paperMesh) paperMesh.visible = true;
      ballProxy.hidden = false;
      binButton.setAttribute("aria-disabled", "true");
      binHint.classList.add("is-hidden");
      startAnimation();
    };

    const shouldFocusMobileBoard = () =>
      Boolean(
        coarsePointerQuery.matches && anchors.board && anchors.board.width < 240,
      );

    const activateDrawing = () => {
      if (!drawingActive) {
        drawingActive = true;
        drawingCanvas.dataset.active = "true";
        drawingCanvas.tabIndex = 0;
        markerButton.setAttribute("aria-pressed", "true");
        layer.dataset.drawingActive = "true";
        clearButton.hidden = false;
        markerHint.classList.add("is-hidden");
      }

      if (shouldFocusMobileBoard()) {
        boardFocused = true;
        layer.dataset.boardFocused = "true";
        focusDismiss.hidden = false;
        focusCloseButton.hidden = false;
        requestLayout();
      }

      drawingCanvas.focus({ preventScroll: true });
    };

    const handleMarkerPointerUp = (event) => {
      if (!shouldFocusMobileBoard() || event.pointerType === "mouse") return;

      suppressMarkerClickUntil = performance.now() + 500;
      event.preventDefault();
      activateDrawing();
    };

    const handleMarkerClick = (event) => {
      if (
        shouldFocusMobileBoard() &&
        performance.now() < suppressMarkerClickUntil
      ) {
        event.preventDefault();
        return;
      }

      activateDrawing();
    };

    const closeBoardFocus = () => {
      if (!boardFocused) return;
      boardFocused = false;
      delete layer.dataset.boardFocused;
      focusDismiss.hidden = true;
      focusCloseButton.hidden = true;
      requestLayout();
      markerButton.focus({ preventScroll: true });
    };

    const pointFromDrawingEvent = (event) => {
      const rect = drawingCanvas.getBoundingClientRect();
      return {
        x: clamp((event.clientX - rect.left) / Math.max(rect.width, 1), 0, 1),
        y: clamp((event.clientY - rect.top) / Math.max(rect.height, 1), 0, 1),
      };
    };

    const onDrawingPointerDown = (event) => {
      if (!drawingActive || drawingPointerId !== null) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      drawingPointerId = event.pointerId;
      activeStroke = [pointFromDrawingEvent(event)];
      strokes.push(activeStroke);
      drawingCanvas.setPointerCapture(event.pointerId);
      drawStoredStrokes();
    };

    const onDrawingPointerMove = (event) => {
      if (event.pointerId !== drawingPointerId || !activeStroke) return;
      event.preventDefault();
      const point = pointFromDrawingEvent(event);
      const previousPoint = activeStroke[activeStroke.length - 1];
      const distance = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
      if (distance < 0.0015) return;
      activeStroke.push(point);
      drawStoredStrokes();
    };

    const finishDrawingPointer = (event) => {
      if (event.pointerId !== drawingPointerId) return;
      if (drawingCanvas.hasPointerCapture(event.pointerId)) {
        drawingCanvas.releasePointerCapture(event.pointerId);
      }
      drawingPointerId = null;
      activeStroke = null;
    };

    const clearDrawing = () => {
      strokes.length = 0;
      drawStoredStrokes();
    };

    const onScroll = () => {
      requestLayout();
    };

    const localPointerPosition = (event) => {
      const sectionRect = section.getBoundingClientRect();
      return {
        x: event.clientX - sectionRect.left,
        y: event.clientY - sectionRect.top,
      };
    };

    const onBallPointerDown = (event) => {
      if (!ball.exists || ball.sinking || ball.pointerId !== null) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      const point = localPointerPosition(event);
      ball.pointerId = event.pointerId;
      ball.dragging = true;
      ball.sleeping = false;
      ball.dragOffsetX = point.x - ball.x;
      ball.dragOffsetY = point.y - ball.y;
      ball.velocityX = 0;
      ball.velocityY = 0;
      ball.samples = [{ x: ball.x, y: ball.y, time: performance.now() }];
      ballProxy.setPointerCapture(event.pointerId);
      startAnimation();
    };

    const onBallPointerMove = (event) => {
      if (!ball.dragging || event.pointerId !== ball.pointerId) return;
      event.preventDefault();
      const point = localPointerPosition(event);
      const previousX = ball.x;
      const previousY = ball.y;
      ball.x = clamp(
        point.x - ball.dragOffsetX,
        ball.radius,
        world.width - ball.radius,
      );
      ball.y = clamp(
        point.y - ball.dragOffsetY,
        ball.radius,
        world.floor - ball.radius,
      );
      ball.angularX = clamp((ball.y - previousY) * 0.16, -7, 7);
      ball.angularY = clamp((ball.x - previousX) * 0.16, -7, 7);
      const now = performance.now();
      ball.samples.push({ x: ball.x, y: ball.y, time: now });
      ball.samples = ball.samples.filter((sample) => now - sample.time <= 120);
      startAnimation();
    };

    const finishBallPointer = (event, cancelled = false) => {
      if (event.pointerId !== ball.pointerId) return;
      if (ballProxy.hasPointerCapture(event.pointerId)) {
        ballProxy.releasePointerCapture(event.pointerId);
      }

      if (!cancelled && ball.samples.length >= 2) {
        const last = ball.samples[ball.samples.length - 1];
        const first = ball.samples[0];
        const elapsed = Math.max((last.time - first.time) / 1000, 0.016);
        ball.velocityX =
          ((last.x - first.x) / elapsed) * PAPER_BALL_CONFIG.physics.throwMultiplier;
        ball.velocityY =
          ((last.y - first.y) / elapsed) * PAPER_BALL_CONFIG.physics.throwMultiplier;
        const speed = Math.hypot(ball.velocityX, ball.velocityY);

        if (speed > PAPER_BALL_CONFIG.physics.maxThrowSpeed) {
          const limiter = PAPER_BALL_CONFIG.physics.maxThrowSpeed / speed;
          ball.velocityX *= limiter;
          ball.velocityY *= limiter;
        }
      } else {
        ball.velocityX = 0;
        ball.velocityY = 0;
      }

      ball.pointerId = null;
      ball.dragging = false;
      ball.samples.length = 0;
      startAnimation();
    };

    const cancelBallPointer = (event) => {
      finishBallPointer(event, true);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeBoardFocus();
    };

    const createRenderer = (three) => {
      const rendererOptions = [
        { alpha: true, antialias: true, powerPreference: "high-performance" },
        { alpha: true, antialias: true },
        { alpha: true, antialias: false, powerPreference: "default" },
      ];
      let lastError = null;

      for (const options of rendererOptions) {
        try {
          return new three.WebGLRenderer({ canvas: threeCanvas, ...options });
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError ?? new Error("Unable to initialize the paper ball renderer");
    };

    const initializePaperFallback = () => {
      if (!paperFallbackContext) return false;
      paperFallbackActive = true;
      updateLayout();
      return true;
    };

    const handleWebGLContextLost = (event) => {
      event.preventDefault();
      if (isDisposed || paperFallbackActive) return;

      renderer = null;
      scene = null;
      camera = null;
      if (initializePaperFallback()) renderPaper();
    };

    const initializeThree = () => {
      if (renderer || threeLoadPromise) return threeLoadPromise;

      threeLoadPromise = import("three")
        .then((three) => {
          if (isDisposed) return;

          renderer = createRenderer(three);
          renderer.setClearColor(0x000000, 0);
          scene = new three.Scene();
          camera = new three.OrthographicCamera(0, 1, 0, 1, 0.1, 100);
          camera.position.set(0, 0, 10);
          camera.lookAt(0, 0, 0);
          scene.add(new three.HemisphereLight(0xffffff, 0xc7c1b8, 2.1));
          const directionalLight = new three.DirectionalLight(0xffffff, 2.8);
          directionalLight.position.set(-2.5, -4, 7);
          scene.add(directionalLight);
          paperGeometry = makePaperGeometry(three);
          paperMaterial = new three.MeshStandardMaterial({
            color: 0xe5dfd4,
            roughness: 0.96,
            metalness: 0,
            flatShading: true,
            transparent: true,
          });
          paperMesh = new three.Mesh(paperGeometry, paperMaterial);
          paperMesh.visible = false;
          scene.add(paperMesh);
          updateLayout();

          if (hasQueuedBall) {
            hasQueuedBall = false;
            spawnBall();
          }
        })
        .catch(() => {
          if (isDisposed) return;

          paperGeometry?.dispose();
          paperMaterial?.dispose();
          renderer?.dispose();
          paperGeometry = null;
          paperMaterial = null;
          paperMesh = null;
          renderer = null;
          scene = null;
          camera = null;
          threeLoadPromise = null;

          if (!initializePaperFallback()) {
            hasQueuedBall = false;
            return;
          }

          if (hasQueuedBall) {
            hasQueuedBall = false;
            spawnBall();
          }
        });

      return threeLoadPromise;
    };

    markerButton.addEventListener("pointerup", handleMarkerPointerUp);
    markerButton.addEventListener("click", handleMarkerClick);
    binButton.addEventListener("click", spawnBall);
    threeCanvas.addEventListener("webglcontextlost", handleWebGLContextLost);
    clearButton.addEventListener("click", clearDrawing);
    focusDismiss.addEventListener("click", closeBoardFocus);
    focusCloseButton.addEventListener("click", closeBoardFocus);
    drawingCanvas.addEventListener("pointerdown", onDrawingPointerDown);
    drawingCanvas.addEventListener("pointermove", onDrawingPointerMove);
    drawingCanvas.addEventListener("pointerup", finishDrawingPointer);
    drawingCanvas.addEventListener("pointercancel", finishDrawingPointer);
    ballProxy.addEventListener("pointerdown", onBallPointerDown);
    ballProxy.addEventListener("pointermove", onBallPointerMove);
    ballProxy.addEventListener("pointerup", finishBallPointer);
    ballProxy.addEventListener("pointercancel", cancelBallPointer);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", requestLayout, { passive: true });
    image.addEventListener("load", requestLayout);

    const resizeObserver = new ResizeObserver(requestLayout);
    resizeObserver.observe(section);
    resizeObserver.observe(image);
    updateLayout();

    if ("IntersectionObserver" in window) {
      sceneObserver = new IntersectionObserver(
        ([entry]) => {
          isSceneNearViewport = entry.isIntersecting;
          if (!isSceneNearViewport) return;

          updateLayout();
          void initializeThree();
          sceneObserver?.disconnect();
        },
        { rootMargin: "100% 0px", threshold: 0 },
      );
      sceneObserver.observe(section);
    } else {
      isSceneNearViewport = true;
      updateLayout();
      void initializeThree();
    }

    return () => {
      isDisposed = true;
      if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      sceneObserver?.disconnect();
      markerButton.removeEventListener("pointerup", handleMarkerPointerUp);
      markerButton.removeEventListener("click", handleMarkerClick);
      binButton.removeEventListener("click", spawnBall);
      threeCanvas.removeEventListener("webglcontextlost", handleWebGLContextLost);
      clearButton.removeEventListener("click", clearDrawing);
      focusDismiss.removeEventListener("click", closeBoardFocus);
      focusCloseButton.removeEventListener("click", closeBoardFocus);
      drawingCanvas.removeEventListener("pointerdown", onDrawingPointerDown);
      drawingCanvas.removeEventListener("pointermove", onDrawingPointerMove);
      drawingCanvas.removeEventListener("pointerup", finishDrawingPointer);
      drawingCanvas.removeEventListener("pointercancel", finishDrawingPointer);
      ballProxy.removeEventListener("pointerdown", onBallPointerDown);
      ballProxy.removeEventListener("pointermove", onBallPointerMove);
      ballProxy.removeEventListener("pointerup", finishBallPointer);
      ballProxy.removeEventListener("pointercancel", cancelBallPointer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", requestLayout);
      image.removeEventListener("load", requestLayout);
      paperGeometry?.dispose();
      paperMaterial?.dispose();
      renderer?.dispose();
      paperFallbackContext?.clearRect(0, 0, world.width, world.height);
      delete layer.dataset.drawingActive;
      clearButton.hidden = true;
      focusCloseButton.hidden = true;
    };
  }, [imageRef, sectionRef]);

  return (
    <div ref={layerRef} className="interactive-build-scene">
      <button
        ref={focusDismissRef}
        className="whiteboard-focus-dismiss"
        type="button"
        aria-label={copy.build.interaction.closeBoard}
        hidden
      />

      <button
        ref={focusCloseButtonRef}
        className="whiteboard-focus-close"
        type="button"
        aria-label={copy.build.interaction.closeBoard}
        data-cursor="interactive"
        hidden
      >
        ×
      </button>

      <canvas
        ref={drawingCanvasRef}
        className="whiteboard-drawing"
        aria-label={copy.build.interaction.drawingArea}
        data-active="false"
      />

      <canvas
        ref={threeCanvasRef}
        className="paper-ball-three-layer"
        aria-hidden="true"
      />

      <canvas
        ref={fallbackCanvasRef}
        className="paper-ball-fallback-layer"
        aria-hidden="true"
      />

      <button
        ref={markerButtonRef}
        className="scene-hit-zone scene-hit-zone--marker"
        type="button"
        aria-label={copy.build.interaction.takeMarker}
        aria-pressed="false"
        data-cursor="interactive"
      />

      <button
        ref={binButtonRef}
        className="scene-hit-zone scene-hit-zone--bin"
        type="button"
        aria-label={copy.build.interaction.createBall}
        data-cursor="interactive"
      />

      <button
        ref={ballProxyRef}
        className="paper-ball-hit-proxy"
        type="button"
        aria-label={copy.build.interaction.grabBall}
        data-cursor="interactive"
        hidden
      />

      <div ref={markerHintRef} className="scene-interaction-hint scene-interaction-hint--marker">
        <span>{copy.build.interaction.draw}</span>
        <HintArrow />
      </div>

      <div ref={binHintRef} className="scene-interaction-hint scene-interaction-hint--bin">
        <HintArrow direction="up" />
        <span>{copy.build.interaction.throw}</span>
      </div>

      <button
        ref={clearButtonRef}
        className="whiteboard-clear"
        type="button"
        data-cursor="interactive"
        hidden
      >
        {copy.build.interaction.clear}
      </button>
    </div>
  );
}
