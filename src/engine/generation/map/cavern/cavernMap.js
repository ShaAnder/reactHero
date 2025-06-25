import { getBlankMap } from "../utils/getBlankMap";
import { validateMap } from "../utils/validateMap";
import { getFurthestFloor } from "../utils/getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../constants/gameConfig";
import { caStep } from "./cavernUtils/caStep";

/**
 * Generates a cave map using cellular automata, with robust spawn handling and diagnostics.
 *
 * - Initializes a noisy map (random walls/floors).
 * - Iteratively smooths the map using CA rules.
 * - Carves a guaranteed spawn room away from the edges.
 * - Ensures map borders are always walls.
 * - Picks start and exit points on floor tiles.
 * - Validates that a path exists between them.
 * - Returns { map, start, exit }.
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
      // STEP 1: Randomly fill the map
      map = getBlankMap(1, dimensions);
      for (let y = 0; y < dimensions; y++) {
        for (let x = 0; x < dimensions; x++) {
          map[y][x] = Math.random() < fillProbability ? 1 : 0;
        }
      }

      // STEP 2: Use Cellular Automata to smooth the map
      for (let i = 0; i < iterations; i++) {
        map = caStep(map);
      }

      // STEP 3: Force map borders to be walls (prevents open edges)
      for (let i = 0; i < dimensions; i++) {
        map[0][i] = 1;
        map[dimensions - 1][i] = 1;
        map[i][0] = 1;
        map[i][dimensions - 1] = 1;
      }

      // STEP 4: Carve a spawn room at a safe, padded location
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

      // DIAGNOSTIC: Count total and reachable floor tiles
      let floorCount = 0;
      for (let y = 0; y < dimensions; y++)
        for (let x = 0; x < dimensions; x++) if (map[y][x] === 0) floorCount++;
      if (floorCount < 10) {
        console.warn(
          `[CavernGen] Attempt ${attempts}: Too few floor tiles (${floorCount})`
        );
        continue;
      }

      // Optional: Flood fill from spawn to check connectivity (simple BFS)
      let reachableCount = countReachable(map, start);
      if (reachableCount < 10) {
        console.warn(
          `[CavernGen] Attempt ${attempts}: Spawn room is isolated (${reachableCount} reachable)`
        );
        continue;
      }

      // STEP 5: Pick exit as the furthest walkable tile from start
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

      // STEP 6: Validate connectivity
      valid = validateMap(map, [start[1], start[0]], [exit[1], exit[0]]);
      if (!valid) {
        console.warn(
          `[CavernGen] Attempt ${attempts}: Map validation failed (no path start→exit)`
        );
        continue;
      }

      // Defensive: Ensure spawn and exit are on walkable tiles
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

// Helper: Simple BFS to count reachable floor tiles from a point
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
How this function works:

- Fills a blank map with random walls and floors based on a fill probability.
- Applies several iterations of cellular automata rules to smooth the cave structure[3][5].
- Forces all map borders to be walls so there are no open edges.
- Carves a 3x3 spawn room at a random, padded location away from the map edge, guaranteeing the player always starts in a valid open area.
- Counts total and reachable floor tiles for diagnostics.
- Ensures the spawn room is connected to a sufficiently large open area.
- Picks the exit as the furthest walkable tile from the start, ensuring maximum traversal.
- Validates that the map is fully traversable from start to exit.
- Robust error handling and logging ensures the map is always valid, never carves outside the map boundary, and never places the spawn at the edge or in an isolated pocket.
*/
