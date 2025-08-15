import { generateForest } from "./forest/forestMap";
import { generateCavern } from "./cavern/cavernMap";
import { DEFAULT_MAP_CONFIG } from "../../../../gameConfig";

// High‑level dispatcher: pick the concrete terrain algorithm based on
// requested environment and return its map + points of interest.
export const generateMap = async (options = DEFAULT_MAP_CONFIG) => {
	const environment = options.environment || "forest";

	// Branch to the concrete generator
	switch (environment) {
		case "forest":
		default:
			return generateForest(options);
		case "cavern":
			return generateCavern(options);
	}
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
