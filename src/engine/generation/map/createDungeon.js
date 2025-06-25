import { generateForest } from "./forest/forestMap";
import { generateCavern } from "./cavern/cavernMap";
import { DEFAULT_MAP_CONFIG } from "../../../constants/gameConfig";

/**
 * Main map generator controller.
 * Delegates to the appropriate algorithm based on environment.
 *
 * @param {Object} options - Map config (dimensions, environment, etc.)
 * @returns {{ map: number[][], start: [number, number], exit: [number, number] }}
 */
export const generateMap = async (options = DEFAULT_MAP_CONFIG) => {
  const environment = options.environment || "forest";

  // swtich setup with our enviornments, whatever user selects will be our randomly generated tileset
  switch (environment) {
    case "forest":
    default:
      return generateForest(options);
    case "cavern":
      return generateCavern(options);
  }
};

/*
How this function works:

This function acts as the central controller for procedural map generation in the game.

- Accepts a configuration object specifying the desired environment and map parameters.
- Determines which map generation algorithm to use based on the selected environment.
- Delegates the map creation process to the appropriate helper function:
  - For "forest", uses a Voronoi-based generator with organic clearings and winding paths.
  - For "cavern", uses a cellular automata generator for natural, cavernous spaces.
- Each helper returns a map, a start position, and an exit position, ensuring the layout is playable and fits the environment's style.
- Returns the result as an object: { map, start, exit }.

Example result structure:
{
  map: [[],[],[]],
  start: [10, 12],
  exit: [55, 60]
}
*/
