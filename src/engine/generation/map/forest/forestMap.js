import { getBlankMap } from "../utils/getBlankMap";
import { initRandomWalker } from "../utils/randomWalker";
import { validateMap } from "../utils/validateMap";
import { getFurthestFloor } from "../utils/getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../../gameConfig";
import { carveOrganicClearing } from "./forestUtils/carveOrganicRoom";
import { relaxSeeds } from "./forestUtils/relaxedSeeds";
import { log } from "../../../../utils/logger";
import { getOrCreateRng } from "../../../../utils/rng";
import {
	FOREST_PADDING,
	FOREST_SPAWN_SIZE,
	FOREST_MAX_ATTEMPTS,
	FOREST_EXIT_MIN_DIST,
	FOREST_SEED_SPACING,
	FOREST_SEED_TRIES_MAX,
	FOREST_DIM_DEFAULT,
	FOREST_NUM_CLEARINGS_DEFAULT,
	FOREST_CLEARING_SIZE_MIN,
	FOREST_CLEARING_SIZE_MAX,
} from "../../../../constants/generation";

// Forest: carve scattered clearings then link them with winding paths.
export const generateForest = (options = DEFAULT_MAP_CONFIG) => {
	// Coordinates returned as [x,y]. Some helpers take [y,x]; we swap where needed.
	const dimensions = options.dimensions || FOREST_DIM_DEFAULT;
	const numClearings = options.numRegions || FOREST_NUM_CLEARINGS_DEFAULT;
	const clearingSize = [
		options.clearingSize?.[0] || FOREST_CLEARING_SIZE_MIN,
		options.clearingSize?.[1] || FOREST_CLEARING_SIZE_MAX,
	];
	const walkerPresets = options.walkerPresets;
	const maxClearingRadius = clearingSize[1];
	const padding = FOREST_PADDING;
	const relaxationIterations = options.voronoiRelaxation || 1;

	let map, start, exit; // final outputs
	let roomCenters = []; // collected clearing centers for stats + walker
	let valid = false; // success flag for attempt loop
	let attempts = 0; // how many tries
	const maxAttempts = FOREST_MAX_ATTEMPTS; // safety cap (tunable)

	const rng = getOrCreateRng(options);
	while (!valid && attempts < maxAttempts) {
		attempts++;
		try {
			// Spawn clearing first so we always have a safe start
			map = getBlankMap(1, dimensions);
			const spawnX =
				padding +
				maxClearingRadius +
				Math.floor(rng() * (dimensions - 2 * (padding + maxClearingRadius)));
			const spawnY =
				padding +
				maxClearingRadius +
				Math.floor(rng() * (dimensions - 2 * (padding + maxClearingRadius)));
			const spawnSize = FOREST_SPAWN_SIZE;
			const spawnCenter = carveOrganicClearing(map, spawnX, spawnY, spawnSize, options);
			if (!spawnCenter) {
				log.warn(
					"ForestGen",
					`Failed to carve spawn room at: ${spawnX} ${spawnY}`
				);
				continue;
			}
			start = [spawnCenter[1], spawnCenter[0]]; // [x, y]

			// Seed other clearings (avoid tight clustering)
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
							rng() * (dimensions - 2 * (padding + maxClearingRadius))
						);
					sy =
						padding +
						maxClearingRadius +
						Math.floor(
							rng() * (dimensions - 2 * (padding + maxClearingRadius))
						);
					tries++;
				} while (
					seeds.some((s) =>
						Math.abs(s.x - sx) < FOREST_SEED_SPACING &&
						Math.abs(s.y - sy) < FOREST_SEED_SPACING
					) &&
					tries < FOREST_SEED_TRIES_MAX
				);
				seeds.push({ x: sx, y: sy });
			}

			// Assign each tile to nearest seed (simple Voronoi)
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

			// Optional relaxation to spread seeds more evenly
			seeds = relaxSeeds(seeds, regionMap, dimensions, relaxationIterations);

			// Carve a blobby clearing around each seed
			roomCenters = []; // reset each attempt
			for (let i = 0; i < seeds.length; i++) {
				const { x, y } = seeds[i];
				const size =
					clearingSize[0] +
					Math.floor(rng() * (clearingSize[1] - clearingSize[0] + 1));
				carveOrganicClearing(map, x, y, size, options);
				roomCenters.push([y, x]);
			}
			if (roomCenters.length < 2) throw new Error("Too few clearings");

			// Connect clearings with winding tunnels
			initRandomWalker(map, roomCenters, walkerPresets);

			// Pick furthest reachable floor as exit (swap coord order for helper)
			let rawExit = getFurthestFloor(
				map,
				[start[1], start[0]],
				FOREST_EXIT_MIN_DIST,
				options
			);
			if (!rawExit) throw new Error("Failed to find exit tile");
			exit = [rawExit[1], rawExit[0]];
			if (exit[0] === start[0] && exit[1] === start[1])
				throw new Error("Exit same as start");

			// Validate start→exit path
			valid = validateMap(map, [start[1], start[0]], [exit[1], exit[0]]);
			if (!valid) throw new Error("Map validation failed (no path start→exit)");

			// Both endpoints must be floor
			if (map[start[1]][start[0]] !== 0 || map[exit[1]][exit[0]] !== 0) {
				throw new Error("Spawn or exit is not on a walkable tile");
			}
		} catch (err) {
			log.warn(
				"ForestGen",
				`Generation error on attempt ${attempts}: ${err.message}`
			);
			continue;
		}
	}

	if (!valid)
		throw new Error("Failed to generate valid forest after max attempts");

	// Stats (consumed by meta layer)
	const stats = { attempts, rooms: (roomCenters || []).length };
	return { map, start, exit, stats };
};

/*
SUMMARY
Random seed scattering + Voronoi partition + optional relaxation gives evenly
distributed candidates. Each becomes an organic clearing; a random walker
connects them; furthest tile becomes exit. Connectivity validated; retries
ensure playability.
*/
