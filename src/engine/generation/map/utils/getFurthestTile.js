/**
 * Finds a random floor tile (value === 0) that is at least `minDistance` away
 * from the given starting point. Used for placing exits, enemies, or objectives far
 * from the player’s spawn. If no tile is far enough, returns the start point as a fallback.
 *
 * @param {number[][]} map - 2D grid of the dungeon where 0 = floor, 1 = wall
 * @param {[number, number]} start - Starting tile coordinate [row, col] (usually player spawn)
 * @param {number} minDistance - Minimum allowed distance from start (default is 20 tiles)
 * @returns {[number, number]} A randomly chosen far-enough floor tile, or the start if none found
 */
export const getFurthestFloor = (map, start, minDistance = 20) => {
  // Deconstruct the start position into sy (row) and sx (col)
  const [sy, sx] = start;

  // Array to hold valid floor tiles that meet distance requirement
  const validTiles = [];

  // Scan the entire map for walkable tiles that are far enough away
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      // Check if the tile is floor (walkable)
      if (map[y][x] === 0) {
        // Calculate Euclidean distance between current tile and start
        const dx = x - sx;
        const dy = y - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If the distance is greater or equal to minimum, add to validTiles
        if (dist >= minDistance) {
          validTiles.push([y, x]);
        }
      }
    }
  }

  // Choose a random valid tile from the list if any exist
  if (validTiles.length > 0) {
    const randomIndex = Math.floor(Math.random() * validTiles.length);
    return validTiles[randomIndex];
  }

  // Otherwise, return the start position as a fallback
  return start;
};

/*
How this file works:

This function searches the entire map for floor tiles (value 0) that are at least a certain distance away from the given start point. It measures the straight-line (Euclidean) distance from each floor tile to the start, collects all tiles that meet or exceed the minimum distance, and then picks one at random. If no such tile exists, it simply returns the start point as a safe fallback.

Math summary:
- Uses the classic Euclidean distance formula: sqrt((x2-x1)^2 + (y2-y1)^2).
- Randomly selects from the valid options using Math.random and Math.floor.

Why this is useful:
- Makes sure objectives, exits, or enemies aren’t too close to the player’s spawn.
- Encourages exploration and ensures a more interesting, spread-out map.
- Adds randomness but always guarantees a valid location.

*/
