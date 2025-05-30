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
  let MAP = []; // Start with an empty array for the map

  // For each row in the grid
  for (let i = 0; i < dimensions; i++) {
    MAP.push([]); // Add a new row

    // Fill the row with the specified value
    for (let x = 0; x < dimensions; x++) {
      MAP[i].push(num);
    }
  }

  return MAP; // Return the completed 2D array
};

/*
How this file works:

This function builds a square 2D grid (like 64x64 tiles) where every cell contains the same value.
It's basically a way to lay down a blank map before doing anything fancy, like carving rooms or tunnels.
You pick the value you want for every tile (like 0 for empty floor, 1 for solid wall).
For example, getBlankMap(1, 64) gives you a 64x64 grid of walls.

Under the hood, it's just classic nested loops:
- The outer loop creates each row.
- The inner loop fills that row with the value you provided.

This is a straightforward way to set up a map before starting procedural generation or resetting the level.
*/

/*
Math summary:
- This approach uses nested loops to fill a 2D array, which is a common and reliable method in JavaScript[3][6][7].
- Modern alternatives include using Array.from or map/fill for more concise code, e.g.:
  Array.from({length: dimensions}, () => Array(dimensions).fill(num))
- Both methods produce a grid where each cell is independently set, avoiding reference bugs.

*/
