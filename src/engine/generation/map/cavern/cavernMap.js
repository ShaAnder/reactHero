import { getBlankMap } from "../utils/getBlankMap";
import { validateMap } from "../utils/validateMap";
import { getFurthestFloor } from "../utils/getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../../gameConfig";
import { caStep } from "./cavernUtils/caStep";
import { log } from "../../../../utils/logger";
import { getOrCreateRng } from "../../../../utils/rng";

// Cavern: noise → smooth → carve spawn → pick distant exit → validate path.
export const generateCavern = (options = DEFAULT_MAP_CONFIG) => {
	// Returns [x,y]; helpers may use [y,x]. Swap when calling them.
	const dimensions = options.dimensions;
	const fillProbability = options.fillProbability || 0.45;
	const iterations = options.caIterations || 5;
	const padding = 5;
	const spawnSize = 3;

	let map, start, exit; // outputs
	let valid = false; // success flag
	let attempts = 0; // attempt counter
	const maxAttempts = 60; // cap
	let lastFloorCount = null; // stats: total floor tiles
	let lastReachable = null; // stats: reachable floor from spawn

	const rng = getOrCreateRng(options);
	while (!valid && attempts < maxAttempts) {
		attempts++;
		try {
			// Fill with random walls/floors
			map = getBlankMap(1, dimensions);
			for (let y = 0; y < dimensions; y++) {
				for (let x = 0; x < dimensions; x++) {
					map[y][x] = rng() < fillProbability ? 1 : 0;
				}
			}

			// Smooth a few times to form blobs
			for (let i = 0; i < iterations; i++) {
				map = caStep(map);
			}

			// Solid border
			for (let i = 0; i < dimensions; i++) {
				map[0][i] = 1;
				map[dimensions - 1][i] = 1;
				map[i][0] = 1;
				map[i][dimensions - 1] = 1;
			}

			// Carve a small open spawn room
			const spawnX = padding + Math.floor(rng() * (dimensions - 2 * padding));
			const spawnY = padding + Math.floor(rng() * (dimensions - 2 * padding));
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

			// Reject maps with too few floors
			let floorCount = 0;
			for (let y = 0; y < dimensions; y++)
				for (let x = 0; x < dimensions; x++) if (map[y][x] === 0) floorCount++;
			if (floorCount < 10) {
				log.warn(
					"CavernGen",
					`Attempt ${attempts}: Too few floor tiles (${floorCount})`
				);
				continue;
			}

			// Reject isolated starts
			let reachableCount = countReachable(map, start);
			if (reachableCount < 10) {
				log.warn(
					"CavernGen",
					`Attempt ${attempts}: Spawn room is isolated (${reachableCount} reachable)`
				);
				continue;
			}

			// Pick furthest reachable tile as exit
			let rawExit = getFurthestFloor(map, [start[1], start[0]], 40);
			if (!rawExit) {
				log.warn("CavernGen", `Attempt ${attempts}: Failed to find exit tile`);
				continue;
			}
			exit = [rawExit[1], rawExit[0]];
			if (exit[0] === start[0] && exit[1] === start[1]) {
				log.warn("CavernGen", `Attempt ${attempts}: Exit same as start`);
				continue;
			}

			// Ensure path start→exit
			valid = validateMap(map, [start[1], start[0]], [exit[1], exit[0]]);
			if (!valid) {
				log.warn(
					"CavernGen",
					`Attempt ${attempts}: Map validation failed (no path start→exit)`
				);
				continue;
			}

			// Both endpoints must be floor
			if (map[start[1]][start[0]] !== 0 || map[exit[1]][exit[0]] !== 0) {
				log.warn(
					"CavernGen",
					`Attempt ${attempts}: Spawn or exit is not on a walkable tile`
				);
				continue;
			}
			// Record stats for successful attempt
			lastFloorCount = floorCount;
			lastReachable = reachableCount;
		} catch (err) {
			log.warn(
				"CavernGen",
				`Generation error on attempt ${attempts}: ${err.message}`
			);
			continue;
		}
	}

	if (!valid)
		throw new Error("Failed to generate valid cave after max attempts");

	// Attach stats for meta consumption
	const stats = {
		attempts,
		rooms: null, // cavern has no discrete 'rooms' concept (could later add pockets)
		floorCount: lastFloorCount,
		reachable: lastReachable,
	};
	return { map, start, exit, stats };
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
