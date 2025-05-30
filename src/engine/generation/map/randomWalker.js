/**
 * Connects room centers using corridor-based random walkers
 *
 * @param {number[][]} map - 2D dungeon grid
 * @param {[number, number][]} roomCenters - List of [y, x] room center positions
 * @param {object} options - Customization
 * @param {number} options.branchChance - Chance to branch a corridor (0–1)
 * @param {number} options.loopChance - Chance to jump to another room and tunnel (0–1)
 * @param {number} options.minCorridor - Minimum corridor length before turning
 * @param {number} options.maxCorridor - Maximum corridor length before turning
 */
export const initRandomWalker = (
  map,
  roomCenters,
  options = {
    branchChance: 0.1,
    loopChance: 0.05,
    minCorridor: 2,
    maxCorridor: 6,
  }
) => {
  const { branchChance, loopChance, minCorridor, maxCorridor } = options;

  const directions = [
    [-1, 0], // up
    [0, 1], // right
    [1, 0], // down
    [0, -1], // left
  ];

  // check if the current tile is within the bounds of the map and NOT on the edges
  const isInside = (y, x) =>
    y > 0 && y < map.length - 1 && x > 0 && x < map[0].length - 1;

  // shuffle and connect rooms randomly (slice the array and sort it randomly)
  const shuffledRooms = roomCenters.slice().sort(() => Math.random() - 0.5);

  // connect the rooms in a random order
  for (let i = 0; i < shuffledRooms.length - 1; i++) {
    let [y, x] = shuffledRooms[i];
    const [targetY, targetX] = shuffledRooms[i + 1];

    // pick initial direction
    let dir = pickInitDir(x, y, targetX, targetY);

    // start connection
    while (x !== targetX || y !== targetY) {
      // choose how far to walk in this dir
      const steps =
        minCorridor +
        Math.floor(Math.random() * (maxCorridor - minCorridor + 1));

      for (let s = 0; s < steps; s++) {
        if (x === targetX && y === targetY) break;

        // Carve tile
        if (isInside(y, x)) map[y][x] = 0;

        // Step in direction
        const ny = y + dir[0];
        const nx = x + dir[1];

        if (isInside(ny, nx)) {
          y = ny;
          x = nx;
          map[y][x] = 0;

          // Optional branch tunnel
          if (Math.random() < branchChance) {
            const [dy, dx] =
              directions[Math.floor(Math.random() * directions.length)];
            const by = y + dy;
            const bx = x + dx;
            if (isInside(by, bx)) map[by][bx] = 0;
          }

          // Optional loop: teleport to a random room and restart
          if (Math.random() < loopChance && roomCenters.length > 2) {
            const randRoom =
              roomCenters[Math.floor(Math.random() * roomCenters.length)];
            y = randRoom[0];
            x = randRoom[1];
            break;
          }
        } else {
          break; // hit boundary, break early
        }
      }
      // After walking, reevaluate direction toward target
      dir = pickInitDir(y, x, targetY, targetX);
    }
  }
};

// Picks a rough direction to go toward target center
const pickInitDir = (y, x, targetY, targetX) => {
  const dy = targetY > y ? 1 : targetY < y ? -1 : 0;
  const dx = targetX > x ? 1 : targetX < x ? -1 : 0;

  // Prefer horizontal or vertical randomly
  if (Math.random() < 0.5) {
    return [dy, 0];
  } else {
    return [0, dx];
  }
};

/**
 * How this works:
 *
 * - Each room center connects to the next via a random walker.
 * - The walker chooses a direction toward the next room and walks a random corridor length (3–6 tiles).
 * - After that, it picks a new direction toward the target and continues.
 * - This makes long corridors with turns instead of single-tile zigzags.
 * - Walkers may also:
 *   - Branch and create small side tunnels
 *   - Jump to another room and continue walking (looping)
 */
