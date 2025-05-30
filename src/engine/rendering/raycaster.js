import { TILE_SIZE } from "../../constants/gameConfig";

/**
 * 2.5D Raycasting renderer using DDA (Digital Differential Analyzer).
 *
 * Casts a ray for each vertical screen slice to detect wall collisions,
 * then draws a vertical wall slice based on how far the ray traveled.
 *
 * This simulates a 3D view from a 2D map by calculating how far each
 * ray travels before hitting a wall and using that distance to scale the wall height.
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
  // Controls how smooth the image is (1 pixel per ray is sharpest)
  const RAY_STEP = 1;

  // Precalculate sine/cosine once per frame to avoid repeated math
  const cosAngle = Math.cos(player.angle);
  const sinAngle = Math.sin(player.angle);

  // Loop across the screen, column by column (one ray per vertical slice)
  for (let x = 0; x < screenWidth; x += RAY_STEP) {
    // --- 1. Figure out the direction of this ray ---
    // cameraX goes from -1 (left) to 1 (right) across the screen
    const cameraX = (2 * x) / screenWidth - 1;

    // Final ray direction combines player angle + camera plane offset
    const rayDirX = cosAngle + planeX * cameraX;
    const rayDirY = sinAngle + planeY * cameraX;

    // --- 2. Which map cell is the player standing in? ---
    let mapX = (player.x / TILE_SIZE) | 0;
    let mapY = (player.y / TILE_SIZE) | 0;

    // --- 3. How far the ray has to travel to cross each gridline ---
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    // --- 4. Set up ray stepping ---
    let stepX, stepY, sideDistX, sideDistY;

    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (player.x / TILE_SIZE - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - player.x / TILE_SIZE) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y / TILE_SIZE - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - player.y / TILE_SIZE) * deltaDistY;
    }

    // --- 5. Use DDA to trace the ray until it hits a wall ---
    let hit = false;
    let side = 0; // 0 = X-side wall, 1 = Y-side wall

    while (!hit) {
      // Step to next map square in X or Y direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      // Check if this new square is a wall
      if (map[mapY] && map[mapY][mapX] === 1) hit = true;
    }

    // --- 6. Get true perpendicular distance to avoid fisheye effect ---
    let perpWallDist;
    if (side === 0) {
      perpWallDist = (mapX - player.x / TILE_SIZE + (1 - stepX) / 2) / rayDirX;
    } else {
      perpWallDist = (mapY - player.y / TILE_SIZE + (1 - stepY) / 2) / rayDirY;
    }

    // Avoid divide-by-zero issues
    if (perpWallDist <= 0) perpWallDist = 0.01;

    // --- 7. Use distance to determine wall height on screen ---
    const wallHeight = Math.floor(screenHeight / perpWallDist);

    // Clamp draw range within screen bounds
    const wallStart = Math.max(0, Math.floor((screenHeight - wallHeight) / 2));
    const wallEnd = Math.min(
      screenHeight,
      Math.ceil((screenHeight + wallHeight) / 2)
    );

    // --- 8. Draw vertical line for wall slice ---
    context.fillStyle = side === 0 ? "#cccccc" : "#888888"; // Dim side walls
    context.fillRect(x, wallStart, RAY_STEP, wallEnd - wallStart);
  }
};

/** how this function works:
 *
 * This is the core of the 2.5D illusion — raycasting!
 *
 * Here's the high-level idea:
 * - For every vertical column on the screen, we shoot out a ray.
 * - The ray walks through the 2D map grid using DDA until it hits a wall.
 * - We calculate how far the ray had to travel.
 * - The farther the wall, the shorter it should appear on screen.
 * - We then draw a vertical strip (1px wide) that’s scaled to match that distance.
 *
 * Details:
 * - We use `cameraX` to determine how far left/right this ray is on screen.
 * - `planeX` and `planeY` define the 2D camera plane (FOV direction).
 * - DDA steps across the grid in discrete increments, always finding the next tile.
 * - We color vertical and horizontal walls differently to simulate shading.
 * - Distance correction (perpendicular distance) avoids fisheye distortion.
 *
 * This function runs every frame and gives us that classic Wolfenstein-style 3D look.
 */
