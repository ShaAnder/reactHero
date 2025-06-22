import { generateDungeon } from "./generationUtils/mapPresets/dungeonMap";
import { generateCastle } from "./generationUtils/mapPresets/castleMap";
import { generateForest } from "./generationUtils/mapPresets/forestMap";
import { generateCavern } from "./generationUtils/mapPresets/cavernMap";
import { DEFAULT_MAP_CONFIG } from "../../../constants/gameConfig";

/**
 * Main map generator controller.
 * Delegates to the appropriate algorithm based on environment.
 *
 * @param {Object} options - Map config (dimensions, environment, etc.)
 * @returns {{ map: number[][], start: [number, number], exit: [number, number] }}
 */
export const generateMap = async (options = DEFAULT_MAP_CONFIG) => {
  const environment = options.environment || "dungeon";

  // swtich setup with our enviornments, whatever user selects will be our randomly generated tileset
  switch (environment) {
    case "forest":
      return generateForest(options);
    case "castle":
      return generateCastle(options);
    case "cavern":
      return generateCavern(options);
    case "dungeon":
    default:
      return generateDungeon(options);
  }
};

/*
How this function works:

This function acts as the central controller for procedural map generation in the game.

- Accepts a configuration object specifying the desired environment and map parameters.
- Determines which map generation algorithm to use based on the selected environment.
- Delegates the map creation process to the appropriate helper function:
  - For "dungeon", uses a classic room-and-corridor generator.
  - For "castle", uses a Voronoi-based generator with grid-like regions for structured rooms.
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
