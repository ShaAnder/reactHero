/**
 * Make a fresh square 2D grid filled with the same value everywhere.
 * Handy starting point before carving rooms, tunnels, etc.
 * @param {number} num        Value to stuff into every tile initially
 * @param {number} dimensions Width AND height (produces dimensions x dimensions)
 * @returns {number[][]}
 */

export const getBlankMap = (num, dimensions) =>
	Array.from({ length: dimensions }, () => Array(dimensions).fill(num));

/*
HOW THIS FILE WORKS

We return an array of length N where each entry is its own Array(N) already
filled with the provided value. Separate inner arrays mean mutating one row
won’t magically mutate the others (a common pitfall if you push the same
array reference repeatedly).

Why Array.from?
- Concise, readable, avoids manual for‑loops.
- Makes intent (“build me N rows”) obvious.

Math / structure recap:
- Grid shape: dimensions × dimensions.
- Memory layout: array of row arrays (row‑major), so access is map[y][x].
*/
