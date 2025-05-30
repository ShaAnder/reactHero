/**
 * Utility function to generate a square 2D map filled with a specified value.
 *
 * - Creates a grid of specified dimensions (e.g., 64x64) filled with a uniform value.
 * - Typically used to initialize a blank dungeon or reset the map.
 *
 * @param {number} num - The value to fill each tile (e.g., 0 for empty, 1 for wall).
 * @param {number} dimensions - The width and height of the square map in tiles.
 * @returns {number[][]} MAP - A 2D array representing the filled map grid.
 */
export const getBlankMap = (num, dimensions) => {
  let MAP = []; // Initialize the map as an empty array

  // Loop through each row
  for (let i = 0; i < dimensions; i++) {
    MAP.push([]); // Add a new row to the map

    // Fill that row with `dimensions` columns
    for (let x = 0; x < dimensions; x++) {
      MAP[i].push(num); // Set every tile in this row to the given number
    }
  }

  return MAP; // Return the complete 2D map
};

/** how this works:
 *
 * This function builds a square 2D grid (e.g., 64x64 tiles) where every cell contains the same value.
 *
 * It's like laying down tiles to form a blank canvas. You specify what number you want in every tile:
 *   - `0` could mean an empty floor.
 *   - `1` might mean solid wall.
 *
 * For example, `getBlankMap(1, 64)` would return a 64x64 grid of walls.
 * You'll often start map generation with this, then carve rooms and paths into it.
 *
 * Under the hood, it's just nested loops:
 *   - Outer loop: makes each row.
 *   - Inner loop: fills that row with numbers.
 *
 * It's a clean, reusable way to set up map data before doing anything more advanced.
 */
