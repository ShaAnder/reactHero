export function getCameraPlane(angle, fovRadians, aspectRatio) {
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  return {
    planeX: -dirY * Math.tan(fovRadians / 2) * aspectRatio,
    planeY: dirX * Math.tan(fovRadians / 2),
  };
}
