import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import helvetikerBold from "three/examples/fonts/helvetiker_bold.typeface.json";

const BASE_ROTATION = { x: -0.08, y: -0.18 };
const TILT_X = 0.28;
const TILT_Y_LEFT = 0.15;
const TILT_Y_RIGHT = 0.36;

function colorForTheme(theme) {
  return theme === "dark" ? "#f8f9fb" : "#111315";
}

export function BuildMark3D({
  theme,
  text = "V.BUILD",
  className = "build-mark",
  fontSize = 4.2,
  onActivate,
  ariaLabel,
}) {
  const hostRef = useRef(null);
  const runtimeRef = useRef(null);
  const suppressActivationRef = useRef(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    let animationFrame = 0;
    let resizeObserver;
    let touchStart;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(0, 0, 22);

      const group = new THREE.Group();
      group.rotation.set(BASE_ROTATION.x, BASE_ROTATION.y, 0);
      scene.add(group);

      const font = new FontLoader().parse(helvetikerBold);
      const geometry = new TextGeometry(text, {
        font,
        size: fontSize,
        depth: fontSize * 0.12,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: fontSize * 0.014,
        bevelSize: fontSize * 0.011,
        bevelSegments: 2,
      });
      geometry.center();

      const currentColor = new THREE.Color(colorForTheme(theme));
      const targetColor = currentColor.clone();
      const material = new THREE.MeshPhysicalMaterial({
        color: currentColor,
        metalness: 0.06,
        roughness: 0.28,
        clearcoat: 0.42,
        clearcoatRoughness: 0.2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x6c7382, 2.2));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
      keyLight.position.set(3.5, 4.5, 6);
      scene.add(keyLight);

      const targetRotation = { ...BASE_ROTATION };
      let previousTime = performance.now();

      const requestRender = () => {
        if (!animationFrame) {
          animationFrame = window.requestAnimationFrame(renderFrame);
        }
      };

      const renderFrame = (time) => {
        animationFrame = 0;
        const delta = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;

        group.rotation.x = THREE.MathUtils.damp(
          group.rotation.x,
          targetRotation.x,
          11,
          delta,
        );
        group.rotation.y = THREE.MathUtils.damp(
          group.rotation.y,
          targetRotation.y,
          11,
          delta,
        );
        material.color.lerp(targetColor, 1 - Math.exp(-8 * delta));
        renderer.render(scene, camera);

        const isSettling =
          Math.abs(group.rotation.x - targetRotation.x) > 0.001 ||
          Math.abs(group.rotation.y - targetRotation.y) > 0.001 ||
          material.color.distanceTo(targetColor) > 0.002;

        if (isSettling) requestRender();
      };

      const resize = () => {
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        requestRender();
      };

      const canTiltWith = (pointerType) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return false;
        }

        return (
          pointerType === "touch" ||
          window.matchMedia("(hover: hover) and (pointer: fine)").matches
        );
      };

      const resetTilt = () => {
        targetRotation.x = BASE_ROTATION.x;
        targetRotation.y = BASE_ROTATION.y;
        requestRender();
      };

      const tiltToPointer = (event) => {
        const bounds = host.getBoundingClientRect();
        const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
        targetRotation.x = BASE_ROTATION.x - offsetY * TILT_X * 2;
        targetRotation.y =
          BASE_ROTATION.y +
          offsetX * (offsetX < 0 ? TILT_Y_LEFT : TILT_Y_RIGHT) * 2;
        requestRender();
      };

      const onPointerMove = (event) => {
        if (!canTiltWith(event.pointerType)) return;
        if (
          event.pointerType === "touch" &&
          touchStart &&
          Math.hypot(
            event.clientX - touchStart.x,
            event.clientY - touchStart.y,
          ) > 7
        ) {
          suppressActivationRef.current = true;
        }
        tiltToPointer(event);
      };

      const onPointerDown = (event) => {
        if (event.pointerType !== "touch" || !canTiltWith("touch")) return;
        touchStart = { x: event.clientX, y: event.clientY };
        host.setPointerCapture?.(event.pointerId);
        tiltToPointer(event);
      };

      const onPointerLeave = (event) => {
        if (event.pointerType !== "touch") resetTilt();
      };

      const onPointerEnd = (event) => {
        if (event.pointerType !== "touch") return;
        if (host.hasPointerCapture?.(event.pointerId)) {
          host.releasePointerCapture(event.pointerId);
        }
        touchStart = undefined;
        resetTilt();
      };

      host.addEventListener("pointermove", onPointerMove);
      host.addEventListener("pointerdown", onPointerDown);
      host.addEventListener("pointerleave", onPointerLeave);
      host.addEventListener("pointerup", onPointerEnd);
      host.addEventListener("pointercancel", onPointerEnd);
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      runtimeRef.current = {
        setTheme(nextTheme) {
          targetColor.set(colorForTheme(nextTheme));
          material.color.copy(targetColor);
          renderer.render(scene, camera);
        },
      };

      return () => {
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerdown", onPointerDown);
        host.removeEventListener("pointerleave", onPointerLeave);
        host.removeEventListener("pointerup", onPointerEnd);
        host.removeEventListener("pointercancel", onPointerEnd);
        resizeObserver?.disconnect();
        window.cancelAnimationFrame(animationFrame);
        runtimeRef.current = null;
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss?.();
        renderer.domElement.remove();
      };
    } catch {
      renderer?.dispose();
      setFallback(true);
      return undefined;
    }
  }, [fontSize, text]);

  useEffect(() => {
    runtimeRef.current?.setTheme(theme);
  }, [theme]);

  const Host = onActivate ? "button" : "div";
  const handleActivate = (event) => {
    if (suppressActivationRef.current) {
      event.preventDefault();
      suppressActivationRef.current = false;
      return;
    }
    onActivate?.(event);
  };

  return (
    <Host
      ref={hostRef}
      className={className}
      data-theme={theme}
      {...(onActivate
        ? { type: "button", onClick: handleActivate, "aria-label": ariaLabel }
        : { "aria-hidden": "true" })}
    >
      {fallback && <span className="build-mark-fallback">{text}</span>}
    </Host>
  );
}
