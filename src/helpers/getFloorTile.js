/**
 * Helper that finds a random floor tile (value 0) from the map.
 * Used for placing spawn points or exits inside valid floor space.
 *
 * @param {number[][]} map - A 2D grid where 0 = floor, 1 = wall.
 * @returns {[number, number]} A coordinate [row, col] for a random open tile.
 */
export const getFloorTile = (map) => {
  // Array to hold all open (floor) tile coordinates
  const open = [];

  // Loop through every row (y) of the map
  for (let y = 0; y < map.length; y++) {
    // Loop through every column (x) in the current row
    for (let x = 0; x < map[y].length; x++) {
      // If this tile is a floor (0), add its [row, col] to the list
      if (map[y][x] === 0) {
        open.push([y, x]);
      }
    }
  }

  // Randomly pick one open tile from the list
  const randomIndex = Math.floor(Math.random() * open.length);
  return open[randomIndex]; // Returns a [y, x] pair like [12, 7]
};

/**
 * How this works:
 *
 * 1. We start with an empty `open` array, which will collect all valid floor tiles.
 * 2. We loop through every row (y) of the map, then every column (x) in that row.
 * 3. If the current tile (map[y][x]) is a floor (i.e. 0), we store its coordinates as [y, x].
 * 4. After scanning the whole map, we have a big list of all walkable tiles.
 * 5. We randomly pick one from this list using Math.random and Math.floor.
 *
 * Example of `open` after scanning a small map:
 * [
 *   [1, 3],
 *   [2, 5],
 *   [4, 1],
 * ]
 *
 * Each entry is a valid [row, column] for a tile the player could stand on.
 *
 * This function is commonly used for:
 * - Placing the player at a random starting location
 * - Dropping in exits, items, or enemies
 * - Finding valid spawn zones on a procedurally generated map
 */
