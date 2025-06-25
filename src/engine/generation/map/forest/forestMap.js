import { getBlankMap } from "../utils/getBlankMap";
import { initRandomWalker } from "../utils/randomWalker";
import { validateMap } from "../utils/validateMap";
import { getFurthestFloor } from "../utils/getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../constants/gameConfig";
import { carveOrganicClearing } from "./forestUtils/carveOrganicRoom";
import { relaxSeeds } from "./forestUtils/relaxedSeeds";

/**
 * Generates a forest map with robust error handling, guaranteed clearing spawn,
 * Lloyd's Voronoi relaxation, and organic clearing carving.
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
      // STEP 1: Carve a spawn clearing first (guaranteed clearing)
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

      // STEP 2: Place random seeds for clearings, first seed is spawn
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

      // STEP 3: Assign each tile to nearest seed (Voronoi region)
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

      // STEP 3.5: Lloyd's relaxation for organic clearing placement
      seeds = relaxSeeds(seeds, regionMap, dimensions, relaxationIterations);

      // STEP 4: Hollow out center of each region as an organic clearing
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

      // STEP 5: Connect clearings with random walker
      initRandomWalker(map, roomCenters, walkerPresets);

      // STEP 6: Pick exit point far from start
      let rawExit = getFurthestFloor(map, [start[1], start[0]], 40);
      if (!rawExit) throw new Error("Failed to find exit tile");
      exit = [rawExit[1], rawExit[0]];
      if (exit[0] === start[0] && exit[1] === start[1])
        throw new Error("Exit same as start");

      // STEP 7: Validate connectivity
      valid = validateMap(map, [start[1], start[0]], [exit[1], exit[0]]);
      if (!valid) throw new Error("Map validation failed (no path start→exit)");

      // Defensive: Ensure spawn and exit are on walkable tiles
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
How this file works:

This function generates a forest-style dungeon map using a mix of Voronoi-based region assignment and organic room carving. It guarantees the player spawns in a walkable clearing and ensures there's always a path to the exit. First, it places a guaranteed 3x3 spawn clearing. Then it randomly scatters seed points for other forest clearings, assigning each tile to its nearest seed to form Voronoi regions. Lloyd’s relaxation shifts the seeds toward the center of their regions, creating more balanced and natural clearing layouts.

Each seed is then used as the center of an organically shaped clearing. The clearings are connected using a random walker algorithm that tunnels winding paths between them. Finally, the function picks a tile far from the spawn to place the exit, and uses BFS to validate that the exit is reachable. If any step fails, it retries generation up to 60 times.

Math summary:
- Voronoi regions are assigned using squared Euclidean distance.
- Lloyd's relaxation iteratively moves seeds to the centroid of their assigned tiles.
- Clearings are carved using organic blob shapes based on radius.
- Walkers use random-length tunneling and occasional branching/looping.
- getFurthestFloor uses BFS to find the tile furthest from the start.
- Map is validated with BFS to ensure connectivity from start to exit.
*/
