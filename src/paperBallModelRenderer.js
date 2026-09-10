const PAPER_BASE_COLOR = [229, 223, 212];
const LIGHT_DIRECTION = normalizeVector(-2.5, -4, 7);

function normalizeVector(x, y, z) {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function rotationMatrix({ x, y, z }) {
  const a = Math.cos(x);
  const b = Math.sin(x);
  const c = Math.cos(y);
  const d = Math.sin(y);
  const e = Math.cos(z);
  const f = Math.sin(z);

  return [
    c * e,
    a * f + b * e * d,
    b * f - a * e * d,
    -c * f,
    a * e - b * f * d,
    b * e + a * f * d,
    d,
    -b * c,
    a * c,
  ];
}

function transformVertex(vertex, matrix) {
  const [x, y, z] = vertex;
  return [
    matrix[0] * x + matrix[3] * y + matrix[6] * z,
    matrix[1] * x + matrix[4] * y + matrix[7] * z,
    matrix[2] * x + matrix[5] * y + matrix[8] * z,
  ];
}

export function createPaperBallTriangles(geometry) {
  const positions = geometry.attributes.position;
  const triangles = [];

  for (let index = 0; index < positions.count; index += 3) {
    triangles.push([
      [positions.getX(index), positions.getY(index), positions.getZ(index)],
      [
        positions.getX(index + 1),
        positions.getY(index + 1),
        positions.getZ(index + 1),
      ],
      [
        positions.getX(index + 2),
        positions.getY(index + 2),
        positions.getZ(index + 2),
      ],
    ]);
  }

  return triangles;
}

function shadeForNormal(nx, ny, nz) {
  const directional = Math.max(
    0,
    nx * LIGHT_DIRECTION[0] +
      ny * LIGHT_DIRECTION[1] +
      nz * LIGHT_DIRECTION[2],
  );
  const hemisphere = 0.72 + Math.max(-1, Math.min(1, -ny)) * 0.06;
  return Math.max(0.58, Math.min(1.08, hemisphere + directional * 0.34));
}

export function drawPaperBallModel(
  context,
  triangles,
  ball,
  rotation,
  viewportTop,
  viewportWidth,
  viewportHeight,
) {
  context.clearRect(0, 0, viewportWidth, viewportHeight);
  if (!ball.exists || triangles.length === 0) return;

  const shadeBuckets = projectPaperBallModel(
    triangles,
    ball,
    rotation,
    viewportTop,
  );

  context.save();
  context.globalAlpha = ball.opacity;
  shadeBuckets.forEach(({ color, polygons }) => {
    if (polygons.length === 0) return;
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = 0.65;
    context.lineJoin = "round";
    context.beginPath();
    polygons.forEach(([x1, y1, x2, y2, x3, y3]) => {
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x3, y3);
      context.closePath();
    });
    context.fill();
    context.stroke();
  });
  context.restore();
}

export function projectPaperBallModel(
  triangles,
  ball,
  rotation,
  viewportTop,
) {
  const matrix = rotationMatrix(rotation);
  const radius = ball.radius * ball.scale;
  const shadeBuckets = Array.from({ length: 14 }, () => []);

  for (const triangle of triangles) {
    const first = transformVertex(triangle[0], matrix);
    const second = transformVertex(triangle[1], matrix);
    const third = transformVertex(triangle[2], matrix);
    const abx = second[0] - first[0];
    const aby = second[1] - first[1];
    const abz = second[2] - first[2];
    const acx = third[0] - first[0];
    const acy = third[1] - first[1];
    const acz = third[2] - first[2];
    const [nx, ny, nz] = normalizeVector(
      aby * acz - abz * acy,
      abz * acx - abx * acz,
      abx * acy - aby * acx,
    );

    if (nz <= 0) continue;

    const shade = shadeForNormal(nx, ny, nz);
    const bucketIndex = Math.max(
      0,
      Math.min(shadeBuckets.length - 1, Math.round((shade - 0.58) * 26)),
    );
    shadeBuckets[bucketIndex].push([
      ball.x + first[0] * radius,
      ball.y - viewportTop + first[1] * radius,
      ball.x + second[0] * radius,
      ball.y - viewportTop + second[1] * radius,
      ball.x + third[0] * radius,
      ball.y - viewportTop + third[1] * radius,
    ]);
  }

  return shadeBuckets.map((polygons, index) => {
    const shade = 0.58 + index / 26;
    const color = PAPER_BASE_COLOR.map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel * shade))),
    );

    return {
      color: `rgb(${color[0]} ${color[1]} ${color[2]})`,
      polygons,
    };
  });
}
