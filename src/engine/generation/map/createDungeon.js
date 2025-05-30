// IMPORTS
import { generateRandomRoom } from "./generateRandomRoom";
import { getBlankMap } from "../../../helpers/getBlankMap";
import { carveRoom } from "./carveRoom";
import { initRandomWalker } from "./randomWalker";
import { validateMap as validateRoute } from "./validateMap";
import { getFloorTile } from "../../../helpers/getFloorTile";
import { getFurthestFloor } from "../../../helpers/getFurthestTile";

/**
 * Main function to generate a playable dungeon layout.
 *
 * - Either accepts a fixed spawn point or generates one randomly.
 * - Randomly places an exit far from the start.
 * - Builds a map using room carving and random walker tunnels.
 * - Validates that the player can reach the exit.
 * - Returns { map, start, exit } for use in game state.
 *
 * @param {Object} [options] - Optional config like seedPosition, dimensions, etc.
 * @returns {{ map: number[][], start: [number, number], exit: [number, number] }}
 */
export const generateMap = async (options = {}) => {
  const dimensions = options.dimensions || 64;
  const numRooms = options.numRooms || 20;
  const maxTunnels = options.maxTunnels || 100;
  const roomMinSize = 3;
  const roomMaxSize = 8;

  let map, start, exit;
  let valid = false;
  let attempts = 0;
  const maxAttempts = 10; // prevent infinite retry loops

  while (!valid && attempts < maxAttempts) {
    attempts++;
    map = getBlankMap(1, dimensions);
    const roomCenters = [];

    for (let i = 0; i < numRooms; i++) {
      const room = generateRandomRoom(map, roomMinSize, roomMaxSize);

      if (room) {
        const center = carveRoom(
          map,
          room.centerX,
          room.centerY,
          room.width,
          room.height
        );
        if (center) {
          roomCenters.push(center);
        }
      }

      // Yield control to keep UI responsive every few rooms
      if (i % 5 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    start = options.seedPosition || getFloorTile(map);

    // Defensive check
    if (!start || !Array.isArray(start)) {
      console.warn("Invalid start position generated:", start);
      continue;
    }

    await initRandomWalker(map, roomCenters, {
      branchChance: 0.1,
      loopChance: 0.05,
      minCorridor: 2,
      maxCorridor: 6,
    });

    // Defensive check for initRandomWalker
    if (!map || !Array.isArray(map)) {
      console.warn("Random walker failed to generate map properly.");
      continue;
    }

    exit = getFurthestFloor(map, start, 40);

    // Defensive check for exit
    if (!exit || !Array.isArray(exit)) {
      console.warn("Invalid exit position generated:", exit);
      continue;
    }

    valid = validateRoute(map, start, exit);

    if (!valid) {
      console.warn(`Map validation failed on attempt ${attempts}. Retrying...`);
      // Yield before retrying
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  if (!valid) {
    throw new Error("Failed to generate valid map after max attempts");
  }

  return { map, start, exit };
};

/** how this function works:
 *
 * This is the core function for generating each dungeon floor.
 *
 * - Accepts some optional settings like size, number of rooms, tunnels, or seed start
 * - Starts by creating a blank 2D map (filled with walls = 1)
 * - Carves several rooms into the map using random positions and sizes
 * - Picks a random floor tile as the player's starting point (or uses a fixed one)
 * - Starts a random walker from the start to dig paths between rooms
 * - Chooses a floor tile far away from the start to serve as the level exit
 * - Uses a BFS check to validate there's a path between start and exit
 *
 * If the generated layout is invalid (no valid path), it retries the whole process.
 * The final output is an object: { map, start, exit }.
 *
 * Example result structure:
 * {
 *   map: [[],[],[]],
 *   start: [10, 12],
 *   exit: [55, 60]
 * }
 *
 */
