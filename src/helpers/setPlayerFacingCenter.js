/**
 * Heuristic spawn orientation. If spawn sits on an outer edge, face inward
 * so the player naturally looks into the space instead of at a wall.
 * Corners get a diagonal; interior defaults to facing right.
 *
 * @param {[number, number]} spawn [y,x] tile coordinates
 * @param {number[][]} map 2D map grid
 * @returns {number} radians (0→right, π/2→down, π→left, -π/2→up)
 */
export const setPlayerFacingInward = (spawn, map) => {
	if (!spawn || !map) return;
	const spawnY = spawn[0];
	const spawnX = spawn[1];
	const maxY = map.length - 1;
	const maxX = map[0].length - 1;

	// Top edge
	if (spawnY === 0) return Math.PI / 2; // Down
	// Bottom edge
	if (spawnY === maxY) return -Math.PI / 2; // Up
	// Left edge
	if (spawnX === 0) return 0; // Right
	// Right edge
	if (spawnX === maxX) return Math.PI; // Left

	// Corners (optional: you can refine this if you want diagonal facing)
	// Top-left
	if (spawnY === 0 && spawnX === 0) return Math.PI / 4; // Down-right
	// Top-right
	if (spawnY === 0 && spawnX === maxX) return (3 * Math.PI) / 4; // Down-left
	// Bottom-left
	if (spawnY === maxY && spawnX === 0) return -Math.PI / 4; // Up-right
	// Bottom-right
	if (spawnY === maxY && spawnX === maxX) return (-3 * Math.PI) / 4; // Up-left

	// Default interior orientation
	return 0;
};
/*
HOW THIS FILE WORKS

Simple boundary tests decide orientation:
- Top row → face downward into map.
- Bottom row → face upward.
- Left edge → face right.
- Right edge → face left.
- Corners get diagonal bias toward center (rough heuristic).

Limitations
- Diagonal angles may not perfectly aim at true geometric center; could
  compute vector to map midpoint for refinement later.
*/
