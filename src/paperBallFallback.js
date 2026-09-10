const OUTLINE = [
  [0, -1],
  [0.56, -0.82],
  [0.9, -0.42],
  [0.98, 0.14],
  [0.68, 0.72],
  [0.12, 1],
  [-0.48, 0.88],
  [-0.88, 0.46],
  [-0.96, -0.12],
  [-0.6, -0.72],
];

const FACETS = [
  { points: [0, 1, 10], color: "#f8f5ee" },
  { points: [1, 2, 10], color: "#eee9df" },
  { points: [2, 3, 10], color: "#d8d1c5" },
  { points: [3, 4, 10], color: "#c5bdb1" },
  { points: [4, 5, 10], color: "#d3ccc0" },
  { points: [5, 6, 10], color: "#e3ddd2" },
  { points: [6, 7, 10], color: "#cec7bb" },
  { points: [7, 8, 10], color: "#bbb3a7" },
  { points: [8, 9, 10], color: "#d6cfc3" },
  { points: [9, 0, 10], color: "#ebe6dc" },
];

export function drawPaperBallFallback(context, ball, world) {
  context.clearRect(0, 0, world.width, world.height);
  if (!ball.exists) return;

  const radius = ball.radius * ball.scale;
  const points = OUTLINE.map(([x, y]) => [x * radius, y * radius]);
  points.push([-0.12 * radius, -0.08 * radius]);

  context.save();
  context.translate(ball.x, ball.y);
  context.rotate(ball.angularY * 0.12);
  context.globalAlpha = ball.opacity;
  context.lineJoin = "round";

  FACETS.forEach(({ points: indices, color }) => {
    context.beginPath();
    context.moveTo(...points[indices[0]]);
    indices.slice(1).forEach((index) => context.lineTo(...points[index]));
    context.closePath();
    context.fillStyle = color;
    context.fill();
  });

  context.beginPath();
  context.moveTo(...points[0]);
  OUTLINE.slice(1).forEach((_, index) => context.lineTo(...points[index + 1]));
  context.closePath();
  context.strokeStyle = "rgb(105 100 93 / 35%)";
  context.lineWidth = Math.max(0.8, radius * 0.035);
  context.stroke();
  context.restore();
}
