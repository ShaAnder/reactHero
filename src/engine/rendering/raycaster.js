import { TILE_SIZE } from "../../constants/gameConfig";

/**
 * Classic 2.5D Raycaster with detailed comments for clarity.
 * - Casts one ray per screen column (RAY_STEP can be increased for performance)
 * - Uses DDA (Digital Differential Analyzer) to step through the map grid
 * - Calculates perpendicular wall distance to avoid fish-eye distortion
 * - Colors walls based on hit side for depth cueing
 */
export const rayCaster = ({
  player,
  planeX,
  planeY,
  screenWidth,
  screenHeight,
  map,
  context,
}) => {
  // Number of pixels between rays (1 = full resolution, >1 = faster, blockier)
  const RAY_STEP = 1;

  // Precompute player direction for efficiency
  const cosAngle = Math.cos(player.angle);
  const sinAngle = Math.sin(player.angle);

  // Loop over each vertical slice of the screen
  for (let x = 0; x < screenWidth; x += RAY_STEP) {
    // --- 1. Camera Plane Projection ---
    // cameraX: -1 (left), 0 (center), +1 (right)
    const cameraX = (2 * x) / screenWidth - 1;
    // Calculate ray direction for this column
    const rayDirX = cosAngle + planeX * cameraX;
    const rayDirY = sinAngle + planeY * cameraX;

    // --- 2. Map Grid Position ---
    // Find which map cell the player is in (integer indices)
    let mapX = (player.x / TILE_SIZE) | 0;
    let mapY = (player.y / TILE_SIZE) | 0;

    // --- 3. DDA Setup: Distance to next gridline in X and Y ---
    // How far along the ray to cross a gridline in X or Y
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    // --- 4. Step Direction and Initial Side Distances ---
    let stepX, stepY, sideDistX, sideDistY;
    // X direction
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (player.x / TILE_SIZE - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - player.x / TILE_SIZE) * deltaDistX;
    }
    // Y direction
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y / TILE_SIZE - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - player.y / TILE_SIZE) * deltaDistY;
    }

    // --- 5. DDA: Step through the grid until a wall is hit ---
    let hit = false,
      side = 0;
    while (!hit) {
      // Move to next gridline in X or Y (whichever is closer)
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0; // Hit a vertical wall
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1; // Hit a horizontal wall
      }
      // Stop if we hit a wall (value 1 in the map)
      if (map[mapY] && map[mapY][mapX] === 1) hit = true;
    }

    // --- 6. Calculate Perpendicular Wall Distance (avoids fish-eye) ---
    let perpWallDist;
    if (side === 0) {
      perpWallDist = (mapX - player.x / TILE_SIZE + (1 - stepX) / 2) / rayDirX;
    } else {
      perpWallDist = (mapY - player.y / TILE_SIZE + (1 - stepY) / 2) / rayDirY;
    }
    // Prevent division by zero or negative distance
    if (perpWallDist <= 0) perpWallDist = 0.01;

    // --- 7. Calculate Wall Slice Height and Position ---
    // Perspective: closer walls are taller
    const wallHeight = Math.floor(screenHeight / perpWallDist);
    // Vertically center the wall slice
    const wallStart = Math.max(0, Math.floor((screenHeight - wallHeight) / 2));
    const wallEnd = Math.min(
      screenHeight,
      Math.ceil((screenHeight + wallHeight) / 2)
    );

    // --- 8. Draw the Wall Slice ---
    // Shade vertical and horizontal walls differently
    context.fillStyle = side === 0 ? "#cccccc" : "#888888";
    context.fillRect(x, wallStart, RAY_STEP, wallEnd - wallStart);
  }
};

/*

Core Concept
A raycaster simulates a 3D world using 2D math by casting invisible rays from the player’s viewpoint—one for each vertical column on the screen. Each ray checks how far it travels before hitting a wall in the 2D map. The closer the wall, the taller it appears on screen, creating the illusion of depth.

Step-by-Step Breakdown
1. Camera Plane & Ray Direction

The screen is divided into columns, each mapped to a value (cameraX) between -1 (left) and +1 (right).

The camera plane defines the field of view (FOV) width and orientation.

For each column, the ray’s direction (rayDirX, rayDirY) is calculated using the player’s direction and the camera plane:

text
rayDirX = dirX + planeX * cameraX
rayDirY = dirY + planeY * cameraX
This spreads the rays evenly across the FOV, with the center ray pointing straight ahead and the side rays pointing to the FOV’s edges.

2. Player Position on the Map

The player’s pixel position is converted to a map grid tile by dividing by TILE_SIZE and rounding down.

3. DDA Setup (Digital Differential Analyzer)

deltaDistX and deltaDistY represent how far the ray must travel to cross the next vertical or horizontal grid line, respectively.

The DDA algorithm uses these distances to efficiently step the ray through the map grid, checking for wall collisions.

4. Step & Initial Side Distances

stepX and stepY determine if the ray moves left/right or up/down.

sideDistX and sideDistY calculate the initial distances from the ray’s start to the first grid line in each direction.

5. DDA Loop – Stepping Until Hit

The ray advances through the grid, always stepping in the direction (x or y) with the shortest distance to the next grid line, until it hits a wall.

6. Calculate Perpendicular Wall Distance

To avoid the fish-eye effect (warped walls at the screen edges), the distance to the wall is measured perpendicular to the screen, not along the ray’s path.

This is done using:

For vertical wall hits:

text
perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX
For horizontal wall hits:

text
perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY
This correction ensures accurate wall heights and perspective.

7. Wall Height on Screen

Wall slice height is calculated by dividing the screen height by the perpendicular wall distance: closer walls appear taller, further ones shorter.

8. Draw the Wall Slice

For each column, a vertical line is drawn with height based on distance.

Wall color can be adjusted based on orientation for a simple lighting effect.

Extra Concepts
RAY_STEP: Increasing this skips columns for faster but chunkier rendering (retro look).

Trigonometry Recap: Trigonometric functions (sine, cosine, tangent) relate triangle angles to side lengths, essential for calculating ray directions and distances in the raycaster.

Trigonometry Essentials
Right Triangle Sides: Opposite, Adjacent, Hypotenuse.

Main Ratios:

Sine (sin θ): Opposite / Hypotenuse

Cosine (cos θ): Adjacent / Hypotenuse

Tangent (tan θ): Opposite / Adjacent

SOH CAH TOA helps remember these relationships.

Applications: Used to solve triangles, model waves, and in navigation, physics, and graphics

*/
