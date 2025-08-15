// Connectivity check: is there a walkable path from start tile to exit tile?
// We run a simple BFS flood fill on floor cells (0) and bail early if we
// reach the exit.

export const validateMap = (map, start, exit) => {
	const [startY, startX] = start;
	const [exitY, exitX] = exit;
	const rows = map.length;
	const cols = map[0].length;

	// Track visited tiles so we don't loop forever
	const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
	const queue = [[startY, startX]];
	visited[startY][startX] = true;

	// 4‑way movement only (no diagonals keeps logic simple & consistent with movement)
	const directions = [
		[-1, 0], // up
		[1, 0], // down
		[0, -1], // left
		[0, 1], // right
	];

	// Standard BFS loop
	while (queue.length > 0) {
		const [y, x] = queue.shift();

		// Early exit: found the goal
		if (y === exitY && x === exitX) {
			return true;
		}

		// Explore neighbors
		for (const [dy, dx] of directions) {
			const ny = y + dy;
			const nx = x + dx;

			// Bounds + floor + not yet visited
			if (
				ny >= 0 &&
				ny < rows &&
				nx >= 0 &&
				nx < cols &&
				map[ny][nx] === 0 &&
				!visited[ny][nx]
			) {
				visited[ny][nx] = true;
				queue.push([ny, nx]);
			}
		}
	}

	// Exhausted reachable area without touching exit
	return false;
};

/*
HOW THIS WORKS

Breadth‑First Search (BFS) spreads outward in rings. The moment we touch the
exit we know there is at least one path. We stop there; no need to measure
distance. If the queue drains with no hit, map is invalid and caller can
regenerate.
*/
