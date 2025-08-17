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
	if (!spawn || !map) return 0;
	const spawnY = spawn[0];
	const spawnX = spawn[1];
	const centerY = (map.length - 1) / 2;
	const centerX = (map[0].length - 1) / 2;
	// Vector from spawn to map center
	const dy = centerY - spawnY;
	const dx = centerX - spawnX;
	// atan2 expects (y,x) → returns angle where 0 = right, PI/2 = down (canvas convention)
	return Math.atan2(dy, dx);
};
/*
HOW THIS FILE WORKS

Compute vector from spawn tile to geometric center and face along it. Gives a
natural inward look for any spawn position (edges, corners, interior) without
branch logic. Previous heuristic (edge/corner switch) replaced for simplicity.
Limitations: if center is a wall later we might want to bias toward largest
open region; for now geometric center is adequate.
*/
