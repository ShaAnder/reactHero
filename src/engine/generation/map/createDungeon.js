// IMPORTS
import { generateRandomRoom } from "./generateRandomRoom";
import { getBlankMap } from "../../../helpers/getBlankMap";
import { carveRoom } from "./carveRoom";
import { initRandomWalker } from "./randomWalker";
import { validateMap as validateRoute } from "./validateMap";
import { getFurthestFloor } from "../../../helpers/getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../constants/gameConfig";

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
export const generateMap = async (options = DEFAULT_MAP_CONFIG) => {
  const dimensions = options.dimensions;
  const numRooms = options.numRooms;
  const roomMinSize = options.roomMinSize;
  const roomMaxSize = options.roomMaxSize;

  let map, start, exit;
  let valid = false;
  let attempts = 0;
  const maxAttempts = 10; // prevent infinite retry loops

  while (!valid && attempts < maxAttempts) {
    attempts++;
    map = getBlankMap(1, dimensions);
    const roomCenters = [];

    // Step 1: Choose a random spawn point near the outer edges
    const padding = 5;
    const spawnX = Math.floor(Math.random() * padding) + 1;
    const spawnY = Math.floor(Math.random() * padding) + 1;
    const maxX = dimensions - padding - 1;
    const maxY = dimensions - padding - 1;
    const finalX = Math.random() > 0.5 ? spawnX : maxX;
    const finalY = Math.random() > 0.5 ? spawnY : maxY;

    // Step 2: Carve a 3×3 spawn room centered at this point
    const spawnCenter = carveRoom(map, finalX, finalY, 3, 3);

    if (!spawnCenter) {
      console.warn("Failed to carve spawn room at:", finalX, finalY);
      continue;
    }

    // Step 3: Store spawn center as the start position (x, y order)
    start = [spawnCenter[1], spawnCenter[0]]; // [x, y]
    roomCenters.push(spawnCenter);

    // Generate rooms
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
      if (i % 5 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

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

    if (!map || !Array.isArray(map)) {
      console.warn("Random walker failed to generate map properly.");
      continue;
    }

    // Get the furthest floor tile from the start as exit
    let rawExit = getFurthestFloor(map, [start[1], start[0]], 40); // [y, x]
    if (!rawExit || !Array.isArray(rawExit)) {
      console.warn("Invalid exit position generated:", rawExit);
      continue;
    }
    exit = [rawExit[1], rawExit[0]]; // convert to [x, y]

    // Defensive: Exit not same as start
    if (exit[0] === start[0] && exit[1] === start[1]) {
      console.warn("Exit same as start. Retrying...");
      continue;
    }

    // --- NEW: Ensure spawn and exit are on walkable tiles ---
    if (map[start[1]][start[0]] !== 0 || map[exit[1]][exit[0]] !== 0) {
      console.warn("Spawn or exit is not on a walkable tile. Retrying...");
      continue;
    }

    // Validate that the map is completable (path exists)
    valid = validateRoute(
      map,
      [start[1], start[0]], // [y, x]
      [exit[1], exit[0]] // [y, x]
    );

    if (!valid) {
      console.warn(`Map validation failed on attempt ${attempts}. Retrying...`);
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
