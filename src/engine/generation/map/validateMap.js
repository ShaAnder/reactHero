/**
 * Uses BFS to check if the exit is reachable from the player spawn position.
 *
 * @param {number[][]} map - The dungeon map (0 = floor, 1 = wall)
 * @param {[number, number]} start - [y, x] position of player
 * @param {[number, number]} exit - [y, x] position of exit
 * @returns {boolean} - True if the exit is reachable
 */
export const validateMap = (map, start, exit) => {
  const [startY, startX] = start;
  const [exitY, exitX] = exit;
  const rows = map.length;
  const cols = map[0].length;

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[startY, startX]];
  visited[startY][startX] = true;

  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  while (queue.length > 0) {
    const [y, x] = queue.shift();

    if (y === exitY && x === exitX) {
      return true; // reached the exit!
    }

    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;

      if (
        ny >= 0 &&
        ny < rows &&
        nx >= 0 &&
        nx < cols &&
        map[ny][nx] === 0 &&
        !visited[ny][nx]
      ) {
        visited[ny][nx] = true;
        queue.push([ny, nx]);
      }
    }
  }

  return false; // exit was not reachable
};

/**
 * This function makes sure the randomly generated dungeon is actually playable — meaning the player can walk from
 * their starting position to the level’s exit.
 *
 * Breakdown:
 *
 * We create a queue of tiles to explore and a visited map to keep track of what we’ve already checked.
 * Start at the player’s spawn – We enqueue their position and mark it visited.
 * Spread outwards – Using classic BFS, we look at each tile’s neighbors and add floor tiles to the queue.
 * Look for the exit – If at any point we reach the exit tile, we know the path is valid and return true.
 * If we never find it, that means there’s no valid path to the exit, and we return false so the map can be regenerated.
 *
 * This makes sure no level ever spawns with unreachable goals
 */
