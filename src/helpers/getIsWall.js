import { TILE_SIZE } from "../../gameConfig";

/**
 * Quick collision probe: given pixel coordinates, tell me if that spot is
 * solid (wall) or outside the map (also treated as solid so you can’t walk
 * off the edge).
 * @param {number} x world X in pixels
 * @param {number} y world Y in pixels
 * @param {number[][]} map 2D grid (1 = wall, 0 = floor)
 * @returns {boolean}
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
HOW THIS WORKS

We translate from pixels → tile index via floor(x / TILE_SIZE). Any index
out of bounds returns true so movement code can just "if (!getIsWall(...))"
without extra boundary branches.
*/
