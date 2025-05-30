import { TILE_SIZE } from "../constants/gameConfig";

/**
 * Checks whether a given pixel coordinate (x, y) is inside a wall tile.
 *
 * Used for collision detection: if a character or ray intersects a wall tile,
 * we stop movement or stop drawing further in that direction.
 *
 * @param {number} x - X position in world space (in pixels).
 * @param {number} y - Y position in world space (in pixels).
 * @param {number[][]} map - The dungeon map, where 1 = wall and 0 = floor.
 * @returns {boolean} True if the coordinate is inside a wall or out of bounds.
 */
export const getIsWall = (x, y, map) => {
  // Convert world-space pixel coordinates to tile indices
  const tileX = Math.floor(x / TILE_SIZE);
  const tileY = Math.floor(y / TILE_SIZE);

  // Bounds check: if you're outside the map, treat it as a solid wall
  if (tileY < 0 || tileY >= map.length || tileX < 0 || tileX >= map[0].length) {
    return true;
  }

  // Check the tile value: 1 = wall, 0 = floor
  return map[tileY][tileX] === 1;
};

/**
 * How this works:
 *
 * - You pass in a position in pixels (like player.x, player.y).
 * - First we convert it to grid coordinates using Math.floor(x / TILE_SIZE).
 * - Then we check:
 *   1. Is it inside the grid? If not, we treat it like a wall (so you can't walk outside the map).
 *   2. If it is inside the map, we check whether the tile at that location is a wall.
 * - This lets us use the map array directly for collision detection.
 */
