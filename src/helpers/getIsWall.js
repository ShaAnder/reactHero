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

/*
How this file works:

This function is used for collision detection in a tile-based game. You give it a position in pixel coordinates (like the player or a ray), and it converts that into tile grid coordinates using Math.floor(x / TILE_SIZE). It then checks if the tile is a wall (value 1) or a floor (value 0). If the position is outside the map bounds, it treats it as a wall to prevent the player or rays from moving or drawing outside the map.

Math summary:
- Converts pixel coordinates to tile indices by dividing by TILE_SIZE and flooring the result.
- Checks map boundaries and tile value for collision logic.

*/
