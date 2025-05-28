/**
 * Utility function to generate a square 2D map filled with a specified value.
 *
 * - Creates a grid of specified dimensions (e.g., 64x64) filled with a uniform value.
 *
 * @param {number} num - The value to fill each tile (e.g., 0 for empty, 1 for wall).
 * @param {number} dimensions - The width and height of the square map in tiles.
 * @returns {number[][]} MAP - A 2D array representing the filled map grid.
 */

export const getBlankMap = (num, dimensions) => {
  let MAP = []; // Initialize the map as an empty array

  for (let i = 0; i < dimensions; i++) {
    MAP.push([]); // Add a new row to the map
    for (let x = 0; x < dimensions; x++) {
      MAP[i].push(num); // Fill the row with the specified value
    }
  }

  return MAP; // Return the complete 2D map
};
