import { TILE_SIZE } from "../constants/gameConfig";

/**
 * Checks if a given world position (x, y in pixels) is inside a wall tile.
 *
 * @param {number} x - X coordinate in world pixels.
 * @param {number} y - Y coordinate in world pixels.
 * @param {Array<Array<number>>} map - 2D array representing the map grid (1 = wall, 0 = empty).
 * @returns {boolean} - True if the position is inside a wall tile or out of bounds, false otherwise.
 */
export const getIsWall = (x, y, map) => {
  // Convert world pixel coordinates to tile indices
  const tileX = Math.floor(x / TILE_SIZE);
  const tileY = Math.floor(y / TILE_SIZE);

  // If the position is outside the map boundaries, treat it as a wall
  if (tileY < 0 || tileY >= map.length || tileX < 0 || tileX >= map[0].length) {
    return true;
  }

  // Return true if the tile at (tileY, tileX) is a wall (value 1)
  return map[tileY][tileX] === 1;
};

/*

Convert World Coordinates to Map Tiles:

The world uses pixel coordinates, but the map is a grid of tiles.

Dividing by TILE_SIZE and flooring the result gives the tile indices (tileX, tileY).

Bounds Checking:

If the calculated tile indices are outside the map’s valid range, the function returns true (treats out-of-bounds as a wall).

This prevents rays or movement from going outside the playable area.

Wall Check:

Checks the map grid at [tileY][tileX].

If the value is 1, it’s a wall; if 0, it’s empty space.

*/
