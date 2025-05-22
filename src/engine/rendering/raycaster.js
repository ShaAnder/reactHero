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
    const wallStart = Math.max(0, ((screenHeight - wallHeight) / 2) | 0);
    const wallEnd = Math.min(
      screenHeight,
      ((screenHeight + wallHeight) / 2) | 0
    );

    // --- 8. Draw the Wall Slice ---
    // Shade vertical and horizontal walls differently
    context.fillStyle = side === 0 ? "#cccccc" : "#888888";
    context.fillRect(x, wallStart, RAY_STEP, wallEnd - wallStart);
  }
};
