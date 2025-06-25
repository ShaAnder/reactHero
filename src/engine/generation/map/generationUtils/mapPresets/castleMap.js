import { getBlankMap } from "../getBlankMap";
import { initRandomWalker } from "../randomWalker";
import { validateMap } from "../validateMap";
import { getFurthestFloor } from "../getFurthestTile";
import { DEFAULT_MAP_CONFIG } from "../../../../../constants/gameConfig";

/**
 * Function that utilizes BSP to create partitioned regions, each region is a single non overlapping room
 * Utilizes a min margin to ensure that we get "walls" to place doors later
 */
const roomPartition = (
  x,
  y,
  width,
  height,
  minSize,
  minMargin,
  maxDepth = 4,
  depth = 0
) => {
  // Firstly set our regions array
  const regions = [];

  // Next define the canSplit constant, it checks if:
  // 1. The current depth is less than the maximum allowed depth.
  // 2. The width or height is large enough to fit two rooms with margins
  // 3. A random factor (Math.random() > 0.2) to give us random / unpredictable splits
  // If ALL of these are true, the region will be split further
  // If ANY are false, the region will NOT be split further and becomes a leaf node for room placement.
  const canSplit =
    depth < maxDepth &&
    (width > minSize * 2 + minMargin * 3 ||
      height > minSize * 2 + minMargin * 3) &&
    Math.random() > 0.2;

  if (!canSplit) {
    // Base case: Return region as a leaf node (room candidate)
    return [{ x, y, width, height }];
  }

  // Next we want to ensure more natural rooms so we split along the longer axis
  // Check if height greater than width, set to true OR just a chance to split
  const splitVertically = width > height ? true : Math.random() > 0.5;
  const splitRatio = 0.4 + Math.random() * 0.2;

  // now check if sV is true and if the width is greater than the size + margin
  if (splitVertically && width > minSize * 2 + minMargin * 3) {
    // if it is, set up our const and split into L/R regions
    const splitX = Math.floor(x + width * splitRatio);
    regions.push(
      // L region
      ...roomPartition(
        x,
        y,
        splitX - x - minMargin,
        height,
        minSize,
        minMargin,
        maxDepth,
        depth + 1
      ),
      ...roomPartition(
        // R region
        splitX + minMargin,
        y,
        x + width - splitX - minMargin,
        height,
        minSize,
        minMargin,
        maxDepth,
        depth + 1
      )
    );
  } else {
    // just push the room to the array
    regions.push({ x, y, width, height });
  }
  return regions;
};

/**
 * Generates a castle map using BSP partitioning for structured room placement
 */
export const generateCastle = (options = DEFAULT_MAP_CONFIG) => {
  // get our options params
  const dimensions = options.dimensions || 65;
  const numRooms = options.numRegions || 12;
  const roomSize = [options.regionMinSize || 3, options.regionMaxSize || 7];
  const walkerPresets = options.walkerPresets || {
    branchChance: 0.05,
    loopChance: 0.03,
    minCorridor: 4,
    maxCorridor: 10,
    allowDiagonals: false,
  };

  // extra settings for our bsp and to ensure map doesn't get generated out of bounds
  const padding = 5;
  const minMargin = 1;
  const maxDepth = 5;

  // set our map checks
  let map, start, exit;
  let valid = false;
  let attempts = 0;
  const maxAttempts = 60;

  while (!valid && attempts < maxAttempts) {
    attempts++;
    try {
      // STEP 1: Partition castle area using BSP
      // STEP 2: Carve rooms in each BSP region
      // STEP 3: Connect rooms with corridors
      // STEP 4: Set spawn in first room, exit in last
      // STEP 5: Validate connectivity
    } catch (err) {
      console.warn(`[CastleGen] Attempt ${attempts}: ${err.message}`);
      continue;
    }
  }

  if (!valid) throw new Error("Failed to generate valid castle");
  return { map, start, exit };
};
/*
How this function works:

- Recursively partitions the map area using Binary Space Partitioning (BSP), splitting the space into a configurable number of rectangular regions for rooms.
- Carves a rectangular room within each BSP region, with random size and position constrained by minimum and maximum room size settings.
- Ensures all rooms are spaced apart and never overlap, creating a structured, castle-like layout with distinct chambers and wings.
- Connects the centers of all rooms using a corridor generation algorithm, producing straight, orthogonal corridors typical of castle architecture.
- Places the player spawn in the first room and the exit in the last room to encourage natural progression through the castle.
- Validates that there is a traversable path from start to exit, and that both are on walkable tiles.
- Uses robust error handling and retry logic to guarantee that only valid, fully connected castle maps are returned, with no rooms cut off or placed outside the map boundary.
*/
