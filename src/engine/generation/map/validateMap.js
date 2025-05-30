// This function checks if the player can actually reach the exit in the dungeon.
// I use a simple Breadth-First Search (BFS) to make sure there's a valid path from the start to the exit.
//
// map: 2D array (0 = floor, 1 = wall)
// start: [y, x] for the player's starting position
// exit: [y, x] for the exit location
// Returns true if the exit is reachable, false otherwise

export const validateMap = (map, start, exit) => {
  const [startY, startX] = start;
  const [exitY, exitX] = exit;
  const rows = map.length;
  const cols = map[0].length;

  // Track which tiles we've already checked
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[startY, startX]];
  visited[startY][startX] = true;

  // The four directions we can move: up, down, left, right
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  // Classic BFS loop
  while (queue.length > 0) {
    const [y, x] = queue.shift();

    // If we've reached the exit, we're done!
    if (y === exitY && x === exitX) {
      return true;
    }

    // Check all four neighbors
    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;

      // Stay inside the map, only walk on floor tiles, and don't revisit tiles
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

  // If we finish BFS without finding the exit, it's not reachable
  return false;
};

/*
How this file works:

This function makes sure the randomly generated dungeon is actually playable — meaning the player can walk from their starting position to the level’s exit. I use a queue to explore the map, marking each floor tile as visited as I go. The search spreads out from the player’s spawn position, checking each neighbor in all four directions. If I ever reach the exit, I know the map is valid. If not, the function returns false so the map can be regenerated.

Math summary:
- This is a standard BFS (Breadth-First Search) on a 2D grid.
- The queue ensures we check each tile in the shortest possible path order.
- The visited array prevents infinite loops and redundant checks.

This keeps the game fair by guaranteeing that every generated level is actually solvable!
*/
