const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

export function getPaperBallViewport({
  sectionTop,
  sectionHeight,
  viewportHeight,
}) {
  const height = Math.max(1, Math.min(sectionHeight, viewportHeight));
  const top = clamp(-sectionTop, 0, Math.max(0, sectionHeight - height));

  return {
    top,
    height,
    bottom: top + height,
  };
}
