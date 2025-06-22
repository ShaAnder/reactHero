import { getBlankMap } from "../getBlankMap";
import { initRandomWalker } from "../randomWalker";
import { validateMap } from "../validateMap";
import { getFurthestFloor } from "../getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../../constants/gameConfig";

/**
 * Generates a castle map using grid-based Voronoi regions for rooms and corridors.
 * Robust error handling prevents browser crashes and logs issues for debugging.
 */
export const generateCastle = (options = DEFAULT_MAP_CONFIG) => {
  const dimensions = options.dimensions || 65;
  const numRooms = options.numRegions || 8;
  const roomSize = [options.regionMinSize || 6, options.regionMaxSize || 10];
  const walkerPresets = options.walkerPresets || {
    branchChance: 0.1,
    loopChance: 0.05,
    minCorridor: 2,
    maxCorridor: 6,
    allowDiagonals: false,
  };
  const maxRoomRadius = roomSize[1];
  const padding = 5;

  let map, start, exit;
  let valid = false;
  let attempts = 0;
  const maxAttempts = 60;

  while (!valid && attempts < maxAttempts) {
    attempts++;
    try {
      // STEP 1: Carve a dedicated spawn room at a safe, padded location
      map = getBlankMap(1, dimensions);
      const spawnX =
        padding +
        maxRoomRadius +
        Math.floor(
          Math.random() * (dimensions - 2 * (padding + maxRoomRadius))
        );
      const spawnY =
        padding +
        maxRoomRadius +
        Math.floor(
          Math.random() * (dimensions - 2 * (padding + maxRoomRadius))
        );
      const spawnSize = 3;
      // Carve a 3x3 spawn room
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

      // STEP 2: Place seeds in a grid for rooms, first seed is spawn
      let seeds = [{ x: spawnX, y: spawnY }];
      const gridSize = Math.ceil(Math.sqrt(numRooms));
      for (let gx = 0; gx < gridSize; gx++) {
        for (let gy = 0; gy < gridSize; gy++) {
          if (seeds.length >= numRooms) break;
          // Place seeds away from edge so rooms never overlap boundary
          const x =
            padding +
            maxRoomRadius +
            Math.floor(
              (gx + 0.5) *
                ((dimensions - 2 * (padding + maxRoomRadius)) / gridSize)
            );
          const y =
            padding +
            maxRoomRadius +
            Math.floor(
              (gy + 0.5) *
                ((dimensions - 2 * (padding + maxRoomRadius)) / gridSize)
            );
          // Don't duplicate the spawn seed
          if (Math.abs(x - spawnX) < 2 && Math.abs(y - spawnY) < 2) continue;
          seeds.push({ x, y });
        }
      }
      if (!seeds || seeds.length === 0) throw new Error("No seeds generated");

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

      // STEP 4: Hollow out each region as a room (never out of bounds)
      let roomCenters = [];
      for (let i = 0; i < seeds.length; i++) {
        const { x, y } = seeds[i];
        const size =
          roomSize[0] +
          Math.floor(Math.random() * (roomSize[1] - roomSize[0] + 1));
        for (let dy = -size; dy <= size; dy++) {
          for (let dx = -size; dx <= size; dx++) {
            const nx = x + dx,
              ny = y + dy;
            if (
              nx >= 0 &&
              nx < dimensions &&
              ny >= 0 &&
              ny < dimensions &&
              regionMap[ny][nx] === i
            ) {
              map[ny][nx] = 0;
            }
          }
        }
        roomCenters.push([y, x]); // [y, x] for walker
      }
      if (roomCenters.length < 2) throw new Error("Too few room centers");

      // STEP 5: Connect rooms with random walker
      initRandomWalker(map, roomCenters, walkerPresets);

      // STEP 6: Pick start and exit points in different rooms
      const floorTiles = [];
      for (let y = 0; y < dimensions; y++)
        for (let x = 0; x < dimensions; x++)
          if (map[y][x] === 0) floorTiles.push([x, y]);
      if (floorTiles.length < 2)
        throw new Error("Not enough floor tiles for start/exit");
      // Use the dedicated spawn as start
      // Pick exit as furthest from spawn
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
        `[CastleGen] Generation error on attempt ${attempts}: ${err.message}`
      );
      continue;
    }
  }

  if (!valid)
    throw new Error("Failed to generate valid castle after max attempts");

  return { map, start, exit };
};
