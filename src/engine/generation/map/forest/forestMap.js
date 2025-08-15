import { getBlankMap } from "../utils/getBlankMap";
import { initRandomWalker } from "../utils/randomWalker";
import { validateMap } from "../utils/validateMap";
import { getFurthestFloor } from "../utils/getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../../gameConfig";
import { carveOrganicClearing } from "./forestUtils/carveOrganicRoom";
import { relaxSeeds } from "./forestUtils/relaxedSeeds";

/*
HOW THIS FILE WORKS / FOREST GENERATION

We simulate a cluster of forest clearings linked by winding paths.

Attempt loop outline:
1. Carve a guaranteed spawn clearing somewhere safely padded from edges.
2. Scatter seed points for other clearings (avoid clumping very tight).
3. Assign each tile to its nearest seed (Voronoi partition using squared
	distance for speed) creating coarse regions.
4. Optionally relax seeds (Lloyd style) to nudge them toward their region
	centroids for a more balanced spread.
5. Carve an organic clearing around each seed (variable radius / blobby carve).
6. Connect clearings using a random‑walk tunneler (meandering natural paths).
7. Pick the furthest reachable floor tile from spawn as the exit so the
	player naturally traverses the space.
8. Validate connectivity (BFS). Retry if anything fails.

Design goals:
- Guaranteed safe start.
- Variety from seed jitter + organic carving.
- Natural path layout via walkers instead of straight corridors.
*/
export const generateForest = (options = DEFAULT_MAP_CONFIG) => {
	const dimensions = options.dimensions || 65;
	const numClearings = options.numRegions || 10;
	const clearingSize = [
		options.clearingSize?.[0] || 1,
		options.clearingSize?.[1] || 2,
	];
	const walkerPresets = options.walkerPresets;
	const maxClearingRadius = clearingSize[1];
	const padding = 5;
	const relaxationIterations = options.voronoiRelaxation || 1;

	let map, start, exit;
	let valid = false;
	let attempts = 0;
	const maxAttempts = 60;

	while (!valid && attempts < maxAttempts) {
		attempts++;
		try {
			// Guaranteed spawn clearing first so we always have a valid start
			map = getBlankMap(1, dimensions);
			const spawnX =
				padding +
				maxClearingRadius +
				Math.floor(
					Math.random() * (dimensions - 2 * (padding + maxClearingRadius))
				);
			const spawnY =
				padding +
				maxClearingRadius +
				Math.floor(
					Math.random() * (dimensions - 2 * (padding + maxClearingRadius))
				);
			const spawnSize = 3;
			const spawnCenter = carveOrganicClearing(map, spawnX, spawnY, spawnSize);
			if (!spawnCenter) {
				console.warn(
					`[ForestGen] Failed to carve spawn room at: ${spawnX} ${spawnY}`
				);
				continue;
			}
			start = [spawnCenter[1], spawnCenter[0]]; // [x, y]

			// Scatter seed points (first is spawn) with slight spacing constraint
			let seeds = [{ x: spawnCenter[1], y: spawnCenter[0] }];
			for (let i = 1; i < numClearings; i++) {
				let sx,
					sy,
					tries = 0;
				do {
					sx =
						padding +
						maxClearingRadius +
						Math.floor(
							Math.random() * (dimensions - 2 * (padding + maxClearingRadius))
						);
					sy =
						padding +
						maxClearingRadius +
						Math.floor(
							Math.random() * (dimensions - 2 * (padding + maxClearingRadius))
						);
					tries++;
				} while (
					seeds.some((s) => Math.abs(s.x - sx) < 2 && Math.abs(s.y - sy) < 2) &&
					tries < 10
				);
				seeds.push({ x: sx, y: sy });
			}

			// Voronoi assignment (squared distance) -> region indices per tile
			const regionMap = getBlankMap(-1, dimensions);
			for (let y = 0; y < dimensions; y++) {
				for (let x = 0; x < dimensions; x++) {
					let minDist = Infinity,
						closest = 0;
					for (let i = 0; i < seeds.length; i++) {
						const dx = seeds[i].x - x;
						const dy = seeds[i].y - y;
						const dist = dx * dx + dy * dy;
						if (dist < minDist) {
							minDist = dist;
							closest = i;
						}
					}
					regionMap[y][x] = closest;
				}
			}

			// Optional Lloyd-like relaxation to avoid clustered seeds
			seeds = relaxSeeds(seeds, regionMap, dimensions, relaxationIterations);

			// Carve an organic blob clearing for each seed
			let roomCenters = [];
			for (let i = 0; i < seeds.length; i++) {
				const { x, y } = seeds[i];
				const size =
					clearingSize[0] +
					Math.floor(Math.random() * (clearingSize[1] - clearingSize[0] + 1));
				carveOrganicClearing(map, x, y, size);
				roomCenters.push([y, x]);
			}
			if (roomCenters.length < 2) throw new Error("Too few clearings");

			// Random walker tunneling to connect clearings with natural winding paths
			initRandomWalker(map, roomCenters, walkerPresets);

			// Exit selection: furthest reachable floor from spawn
			let rawExit = getFurthestFloor(map, [start[1], start[0]], 40);
			if (!rawExit) throw new Error("Failed to find exit tile");
			exit = [rawExit[1], rawExit[0]];
			if (exit[0] === start[0] && exit[1] === start[1])
				throw new Error("Exit same as start");

			// Connectivity validation (BFS in validateMap)
			valid = validateMap(map, [start[1], start[0]], [exit[1], exit[0]]);
			if (!valid) throw new Error("Map validation failed (no path start→exit)");

			// Defensive sanity: both endpoints must be open tiles
			if (map[start[1]][start[0]] !== 0 || map[exit[1]][exit[0]] !== 0) {
				throw new Error("Spawn or exit is not on a walkable tile");
			}
		} catch (err) {
			console.warn(
				`[ForestGen] Generation error on attempt ${attempts}: ${err.message}`
			);
			continue;
		}
	}

	if (!valid)
		throw new Error("Failed to generate valid forest after max attempts");

	return { map, start, exit };
};

/*
SUMMARY
Random seed scattering + Voronoi partition + optional relaxation gives evenly
distributed candidates. Each becomes an organic clearing; a random walker
connects them; furthest tile becomes exit. Connectivity validated; retries
ensure playability.
*/
