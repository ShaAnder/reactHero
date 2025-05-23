// src/constants/map.js

/**
 * 1 = wall
 * 0 = empty space
 *
 * Map is 11 rows x 15 columns
 */
export const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// This 2D array is a map grid — each number represents either a wall (1) or empty space (0).
// Raycasting uses this grid to figure out what the player can "see" by casting out rays
// in different directions until they hit a wall.
//
// It works like a blueprint of the game world. Even though everything is technically 2D,
// this trick lets us simulate a 3D view from the player's perspective.

// 🧱 Why Use a Grid Map in Raycasting?

// Raycasting is a clever way to fake 3D using 2D math. The game world is built on a grid,
// and the illusion of depth comes from how rays interact with this grid.

// Here's why this grid is essential:

/*
🕹️ Game Logic
- The map tells the engine where the player can go and where walls are.
- Every time the player moves or turns, the engine checks:
  “Is the tile I'm moving into a 0 (empty space) or a 1 (wall)?”

🌅 Raycasting Vision
- Imagine rays as invisible laser beams shot out from the player’s eyes, one per vertical slice of the screen.
- Each ray travels in a straight line until it hits a wall tile (a 1 on the grid).
- When a ray hits a wall, we record the distance to that wall.
- The closer the wall, the taller it gets drawn on screen (like in real life — close things look bigger).
- The farther the wall, the shorter it appears.

🛠️ Expandability
- This map can be expanded with other numbers:
  - 2 could represent enemies
  - 3 could be doors or bridges
  - Any number can trigger custom behavior
*/
