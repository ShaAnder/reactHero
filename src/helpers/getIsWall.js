import { TILE_SIZE } from "../constants/gameConfig";

// Returns true if (x, y) in world pixels is in a wall tile
export const getIsWall = (x, y, map) => {
  const tileX = Math.floor(x / TILE_SIZE);
  const tileY = Math.floor(y / TILE_SIZE);
  if (tileY < 0 || tileY >= map.length || tileX < 0 || tileX >= map[0].length) {
    return true; // Treat out-of-bounds as wall
  }
  return map[tileY][tileX] === 1;
};
