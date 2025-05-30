/**
 * Returns a fixed angle (in radians) that points "into" the dungeon,
 * based on the spawn's edge location.
 *
 * @param {[number, number]} spawn - [spawnY, spawnX] tile coordinates
 * @param {number[][]} map - 2D map array
 * @returns {number} angle in radians (canvas standard: 0 = right, PI/2 = down, PI = left, -PI/2 = up)
 */
export const setPlayerFacingInward = (spawn, map) => {
  if (!spawn || !map) return;
  const spawnY = spawn[0];
  const spawnX = spawn[1];
  const maxY = map.length - 1;
  const maxX = map[0].length - 1;

  // Top edge
  if (spawnY === 0) return Math.PI / 2; // Down
  // Bottom edge
  if (spawnY === maxY) return -Math.PI / 2; // Up
  // Left edge
  if (spawnX === 0) return 0; // Right
  // Right edge
  if (spawnX === maxX) return Math.PI; // Left

  // Corners (optional: you can refine this if you want diagonal facing)
  // Top-left
  if (spawnY === 0 && spawnX === 0) return Math.PI / 4; // Down-right
  // Top-right
  if (spawnY === 0 && spawnX === maxX) return (3 * Math.PI) / 4; // Down-left
  // Bottom-left
  if (spawnY === maxY && spawnX === 0) return -Math.PI / 4; // Up-right
  // Bottom-right
  if (spawnY === maxY && spawnX === maxX) return (-3 * Math.PI) / 4; // Up-left

  // Default: face right
  return 0;
};

// BUG currently doesn't face properly on some angles added to to fix
