/**
 * Creates a square 2D array (map) filled with a specific value.
 *
 * @param {number} num - The value to fill each cell (e.g., 1 for wall, 0 for floor)
 * @param {number} dimensions - The width and height of the map (e.g., 64)
 * @returns {number[][]} - A 2D array of size [dimensions][dimensions] filled with 'num'
 */

export const getBlankMap = (num, dimensions) =>
  Array.from({ length: dimensions }, () => Array(dimensions).fill(num));

/*
How this file works:

This function creates a square 2D array (for example, 64x64 tiles) where every cell is initialized with the same value.
It's typically used to set up a blank game map before generating features like rooms, tunnels, or regions.
You can specify the value to fill each tile (such as 0 for empty floor or 1 for solid wall).
For example, getBlankMap(1, 64) returns a 64x64 grid filled with 1s, representing a solid wall map.

Under the hood, it uses Array.from to generate the grid:
- The outer Array.from creates an array of rows.
- Each row is itself a new array filled with the specified value, created using Array(dimensions).fill(num).
- This ensures each row is a separate array, avoiding reference bugs.

This approach is a modern, concise alternative to using classic nested loops for 2D array initialization in JavaScript[3][4][7].
*/

/*
Math summary:
- This method constructs a 2D array by mapping each row to a new array of the given value.
- Both the classic nested loop and the Array.from approach produce a grid where each cell is independently set.
- This is efficient and avoids common pitfalls like shared references between rows.
*/
