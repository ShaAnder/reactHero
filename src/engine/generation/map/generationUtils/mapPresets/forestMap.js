import { getBlankMap } from "../getBlankMap";
import { initRandomWalker } from "../randomWalker";
import { validateMap } from "../validateMap";
import { getFurthestFloor } from "../getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../../constants/gameConfig";

/**
 * Carves a blobby/circular organic clearing at (centerX, centerY) with a given base radius.
 */
export const carveOrganicClearing = (map, centerX, centerY, baseRadius) => {
  const rows = map.length;
  const cols = map[0].length;
  let carved = false;

  for (let y = -baseRadius; y <= baseRadius; y++) {
    for (let x = -baseRadius; x <= baseRadius; x++) {
      const nx = centerX + x;
      const ny = centerY + y;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
        // Distance from center plus jitter for organic edge
        const dist = Math.sqrt(x * x + y * y);
        const edge = baseRadius + (Math.random() - 0.5) * (baseRadius * 0.5); // 0.5 = blobbiness
        if (dist < edge) {
          map[ny][nx] = 0;
          carved = true;
        }
      }
    }
  }
  return carved ? [centerY, centerX] : null;
};

/**
 * Lloyd's relaxation for Voronoi seeds.
 * Moves each seed to the centroid of its Voronoi region, repeated for N iterations.
 */
function relaxSeeds(seeds, regionMap, dimensions, iterations = 1) {
  for (let iter = 0; iter < iterations; iter++) {
    const newSeeds = [];
    for (let i = 0; i < seeds.length; i++) {
      let sumX = 0,
        sumY = 0,
        count = 0;
      for (let y = 0; y < dimensions; y++) {
        for (let x = 0; x < dimensions; x++) {
          if (regionMap[y][x] === i) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }
      if (count > 0) {
        newSeeds.push({
          x: Math.round(sumX / count),
          y: Math.round(sumY / count),
        });
      } else {
        newSeeds.push(seeds[i]); // fallback if region is empty
      }
    }
    // Reassign regions to new seeds
    for (let y = 0; y < dimensions; y++) {
      for (let x = 0; x < dimensions; x++) {
        let minDist = Infinity,
          closest = 0;
        for (let i = 0; i < newSeeds.length; i++) {
          const dx = newSeeds[i].x - x;
          const dy = newSeeds[i].y - y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        }
        regionMap[y][x] = closest;
      }
    }
    seeds = newSeeds;
  }
  return seeds;
}

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
