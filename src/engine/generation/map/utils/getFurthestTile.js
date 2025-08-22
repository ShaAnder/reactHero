/*
HOW THIS FUNCTION WORKS
Pick a random floor tile at least minDistance away from start. If none qualify,
fallback to the start itself so callers always receive a valid coordinate.
*/
import { getOrCreateRng } from "../../../../utils/rng";
import { FURTHEST_MIN_DIST_DEFAULT } from "../../../../constants/generation";

export const getFurthestFloor = (
	map,
	start,
	minDistance = FURTHEST_MIN_DIST_DEFAULT,
	options = {}
) => {
	// Start broken into row/col for clarity
	const [sy, sx] = start;

	// Collect all candidate floor tiles beyond threshold
	const validTiles = [];

	// Full scan: map size small enough that O(n) each call is fine
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			// Only consider walkable tiles
			if (map[y][x] === 0) {
				// Euclidean distance (diagonal OK, we just want “far away” feel)
				const dx = x - sx;
				const dy = y - sy;
				const dist = Math.sqrt(dx * dx + dy * dy);

				// Keep only if it meets threshold
				if (dist >= minDistance) {
					validTiles.push([y, x]);
				}
			}
		}
	}

	// Random pick among candidates
	if (validTiles.length > 0) {
		const rng = getOrCreateRng(options);
		const randomIndex = Math.floor(rng() * validTiles.length);
		return validTiles[randomIndex];
	}

	// Fallback: nothing far enough, reuse start
	return start;
};

/*
SUMMARY
Scan all floors, keep those far enough, pick one at random. Guarantees some
return value (never undefined) even on tiny cramped maps.
*/
