// This function connects all the room centers in the dungeon with winding corridors.
// I'm using a random-walk approach so the tunnels feel a bit more organic and less grid-like.
//
// map: 2D dungeon array (1 = wall, 0 = floor)
// roomCenters: array of [y, x] pairs for each room's center
// options: lets me tweak how much branching/looping happens and how long the corridors are

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
  // Pull out the options so I can use them easily
  const { branchChance, loopChance, minCorridor, maxCorridor } = options;

  // These are the four basic directions: up, right, down, left
  const directions = [
    [-1, 0], // up
    [0, 1], // right
    [1, 0], // down
    [0, -1], // left
  ];

  // Helper to check if a tile is inside the map and not on the edge
  const isInside = (y, x) =>
    y > 0 && y < map.length - 1 && x > 0 && x < map[0].length - 1;

  // Shuffle the room list so the order is random every time
  const shuffledRooms = roomCenters.slice().sort(() => Math.random() - 0.5);

  // Connect each room to the next one in the shuffled list
  for (let i = 0; i < shuffledRooms.length - 1; i++) {
    let [y, x] = shuffledRooms[i];
    const [targetY, targetX] = shuffledRooms[i + 1];

    // Pick an initial direction toward the target room
    let dir = pickInitDir(x, y, targetX, targetY);

    // Walk from this room center to the next
    while (x !== targetX || y !== targetY) {
      // Pick a random corridor length for this segment
      const steps =
        minCorridor +
        Math.floor(Math.random() * (maxCorridor - minCorridor + 1));

      for (let s = 0; s < steps; s++) {
        if (x === targetX && y === targetY) break;

        // Carve out the current tile as floor
        if (isInside(y, x)) map[y][x] = 0;

        // Move one step in the current direction
        const ny = y + dir[0];
        const nx = x + dir[1];

        if (isInside(ny, nx)) {
          y = ny;
          x = nx;
          map[y][x] = 0;

          // Occasionally branch off and make a little side tunnel
          if (Math.random() < branchChance) {
            const [dy, dx] =
              directions[Math.floor(Math.random() * directions.length)];
            const by = y + dy;
            const bx = x + dx;
            if (isInside(by, bx)) map[by][bx] = 0;
          }

          // Sometimes "loop" by jumping to a random room and continuing from there
          if (Math.random() < loopChance && roomCenters.length > 2) {
            const randRoom =
              roomCenters[Math.floor(Math.random() * roomCenters.length)];
            y = randRoom[0];
            x = randRoom[1];
            break;
          }
        } else {
          // If I hit the map boundary, I break out of this segment early
          break;
        }
      }
      // After each segment, recalculate the direction toward the target room
      dir = pickInitDir(y, x, targetY, targetX);
    }
  }
};

// Helper to pick a rough direction toward the target center.
// Randomizes whether to go vertical or horizontal first for more variety.
const pickInitDir = (y, x, targetY, targetX) => {
  const dy = targetY > y ? 1 : targetY < y ? -1 : 0;
  const dx = targetX > x ? 1 : targetX < x ? -1 : 0;

  // Randomly choose to prioritize vertical or horizontal movement
  if (Math.random() < 0.5) {
    return [dy, 0];
  } else {
    return [0, dx];
  }
};

/*
How this file works:

This code connects all the rooms in the dungeon with winding, natural-looking corridors. For each pair of rooms, a "walker" starts at one room center and carves a path toward the next, walking in random-length segments and turning as needed. Sometimes the walker branches off to make little side tunnels, and occasionally it jumps to a random room to create loops in the dungeon. The pickInitDir helper decides which general direction to move in, and it randomizes whether to go vertical or horizontal first for more organic paths.

Math summary:
- Corridor length is random between minCorridor and maxCorridor (inclusive).
- The walker moves step by step, always checking boundaries.
- Branches and loops are triggered by random chance (branchChance, loopChance).
- Room order is shuffled each time for variety.

*/
