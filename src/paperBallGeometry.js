export function makePaperGeometry(three) {
  const baseGeometry = new three.IcosahedronGeometry(1, 3);
  const geometry = baseGeometry.index
    ? baseGeometry.toNonIndexed()
    : baseGeometry;
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
