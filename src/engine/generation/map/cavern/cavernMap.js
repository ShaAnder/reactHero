import { getBlankMap } from "../utils/getBlankMap";
import { validateMap } from "../utils/validateMap";
import { getFurthestFloor } from "../utils/getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../../gameConfig";
import { caStep } from "./cavernUtils/caStep";

/*
HOW THIS FILE WORKS / CAVERN GENERATION

Goal: produce an “organic” cave with a guaranteed safe spawn and a distant
exit that encourages exploration.

Recipe each attempt:
1. Fill a fresh blank grid with random walls vs floors (noise field).
2. Run several Cellular Automata smoothing passes so isolated pixels merge
	into chunky blobs that feel cave‑like.
3. Force outer border to all walls (no leaking off the map edges).
4. Carve a small spawn room (3x3) somewhere safely padded from edges so
	the player always starts in open space.
5. Count total and reachable floor tiles (diagnostics + early rejection of
	cramped or isolated starts).
6. Find the furthest reachable floor from the spawn (simple BFS utility) –
	this becomes our exit so the player crosses the cave.
7. Validate there is an actual path from start to exit (connectivity + both
	on open tiles). If anything fails, retry.

We cap attempts to avoid infinite loops. Detailed console warnings help tune
parameters when generation is too strict.
*/
export const generateCavern = (options = DEFAULT_MAP_CONFIG) => {
	const dimensions = options.dimensions;
	const fillProbability = options.fillProbability || 0.45;
	const iterations = options.caIterations || 5;
	const padding = 5;
	const spawnSize = 3;

	let map, start, exit;
	let valid = false;
	let attempts = 0;
	const maxAttempts = 60;

	while (!valid && attempts < maxAttempts) {
		attempts++;
		try {
			// Random noise fill (Bernoulli trial per cell)
			map = getBlankMap(1, dimensions);
			for (let y = 0; y < dimensions; y++) {
				for (let x = 0; x < dimensions; x++) {
					map[y][x] = Math.random() < fillProbability ? 1 : 0;
				}
			}

			// CA smoothing: clumps walls / expands pockets creating natural blobs
			for (let i = 0; i < iterations; i++) {
				map = caStep(map);
			}

			// Hard border walls so the player never walks out of bounds
			for (let i = 0; i < dimensions; i++) {
				map[0][i] = 1;
				map[dimensions - 1][i] = 1;
				map[i][0] = 1;
				map[i][dimensions - 1] = 1;
			}

			// Carve spawn room: ensure guaranteed breathable space to start
			const spawnX =
				padding + Math.floor(Math.random() * (dimensions - 2 * padding));
			const spawnY =
				padding + Math.floor(Math.random() * (dimensions - 2 * padding));
			for (
				let dy = -Math.floor(spawnSize / 2);
				dy <= Math.floor(spawnSize / 2);
				dy++
			) {
				for (
					let dx = -Math.floor(spawnSize / 2);
					dx <= Math.floor(spawnSize / 2);
					dx++
				) {
					const nx = spawnX + dx,
						ny = spawnY + dy;
					if (nx >= 0 && nx < dimensions && ny >= 0 && ny < dimensions) {
						map[ny][nx] = 0;
					}
				}
			}
			start = [spawnX, spawnY];

			// Diagnostics: reject caves that are basically solid walls
			let floorCount = 0;
			for (let y = 0; y < dimensions; y++)
				for (let x = 0; x < dimensions; x++) if (map[y][x] === 0) floorCount++;
			if (floorCount < 10) {
				console.warn(
					`[CavernGen] Attempt ${attempts}: Too few floor tiles (${floorCount})`
				);
				continue;
			}

			// Connectivity from spawn: if isolated, pick a new noise sample
			let reachableCount = countReachable(map, start);
			if (reachableCount < 10) {
				console.warn(
					`[CavernGen] Attempt ${attempts}: Spawn room is isolated (${reachableCount} reachable)`
				);
				continue;
			}

			// Goal selection: furthest reachable floor tile encourages traversal
			let rawExit = getFurthestFloor(map, [start[1], start[0]], 40);
			if (!rawExit) {
				console.warn(
					`[CavernGen] Attempt ${attempts}: Failed to find exit tile`
				);
				continue;
			}
			exit = [rawExit[1], rawExit[0]];
			if (exit[0] === start[0] && exit[1] === start[1]) {
				console.warn(`[CavernGen] Attempt ${attempts}: Exit same as start`);
				continue;
			}

			// Final validation: ensure path exists start -> exit
			valid = validateMap(map, [start[1], start[0]], [exit[1], exit[0]]);
			if (!valid) {
				console.warn(
					`[CavernGen] Attempt ${attempts}: Map validation failed (no path start→exit)`
				);
				continue;
			}

			// Defensive sanity: ensure both endpoints are truly open
			if (map[start[1]][start[0]] !== 0 || map[exit[1]][exit[0]] !== 0) {
				console.warn(
					`[CavernGen] Attempt ${attempts}: Spawn or exit is not on a walkable tile`
				);
				continue;
			}
		} catch (err) {
			console.warn(
				`[CavernGen] Generation error on attempt ${attempts}: ${err.message}`
			);
			continue;
		}
	}

	if (!valid)
		throw new Error("Failed to generate valid cave after max attempts");

	return { map, start, exit };
};

// BFS reachability count from spawn: helps reject isolated or tiny pockets
function countReachable(map, start) {
	const [sx, sy] = start;
	const rows = map.length;
	const cols = map[0].length;
	let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
	let queue = [[sy, sx]];
	visited[sy][sx] = true;
	let count = 1;
	const dirs = [
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0],
	];
	while (queue.length) {
		const [y, x] = queue.shift();
		for (const [dy, dx] of dirs) {
			const ny = y + dy,
				nx = x + dx;
			if (
				ny >= 0 &&
				ny < rows &&
				nx >= 0 &&
				nx < cols &&
				!visited[ny][nx] &&
				map[ny][nx] === 0
			) {
				visited[ny][nx] = true;
				queue.push([ny, nx]);
				count++;
			}
		}
	}
	return count;
}

/*
SUMMARY
We throw random noise, smooth it, carve a safe spawn, pick the furthest tile
as an exit, validate connectivity, retry on failure. Warnings surface why a
given attempt failed so tuning is straightforward.
*/
