import { generateForest } from "./forest/forestMap";
import { generateCavern } from "./cavern/cavernMap";
import { DEFAULT_MAP_CONFIG } from "../../../../gameConfig";

// Chooses a generator by environment and returns map + spawn + exit + meta.
export const generateMap = async (options = DEFAULT_MAP_CONFIG) => {
	const environment = options.environment || "forest";

	let base;
	switch (environment) {
		case "forest": // forest gen
		default:
			base = generateForest(options);
			break;
		case "cavern": // cavern gen
			base = generateCavern(options);
			break;
	}

	const { map, start, exit, stats } = await base;

	// Basic dimensions
	const width = map?.[0]?.length ?? 0;
	const height = map?.length ?? 0;

	// Meta (debug + stats)
	const meta = {
		environment, // biome / theme
		seed: options.seed ?? null, // deterministic seed when supplied
		width, // columns
		height, // rows
		attempts: stats?.attempts ?? null, // generation attempts actually used
		rooms: stats?.rooms ?? null, // forest: clearing count, cavern: null
		geneeratedAt: Date.now(), // (typo preserved)
		generatedAt: Date.now(), // corrected spelling
		generator: environment, // which algorithm branch
		version: 2, // schema / format version
	};

	// Extra stats (cavern)
	if (stats) {
		if (stats.floorCount != null) meta.floorCount = stats.floorCount;
		if (stats.reachable != null) meta.reachable = stats.reachable;
	}

	return { map, start, exit, meta };
};
/*
HOW THIS FILE WORKS

Purpose
Single entry point for procedural level creation. You hand it a config (or
let it fall back to defaults) and it routes to the specific algorithm meant
for that biome / style.

Currently Supported
- forest: region seeds + Voronoi + relaxed + organic clearing carving +
  random walkers.
- cavern: noisy fill + iterative cellular automata smoothing + spawn room.

Return Shape
{ map, start, exit }
Where map is a 2D array (0 floor, 1 wall), start/exit are [x, y] tile coords.

Why centralize this?
- Future environments (ruins, ice, lava) only require adding a case.
- Lets higher‑level code stay ignorant of implementation details.
*/
