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
  // How many pixels between rays (1 = sharp, >1 = faster but blockier)
  const RAY_STEP = 1;

  // Cache player angle trig for performance
  const cosAngle = Math.cos(player.angle);
  const sinAngle = Math.sin(player.angle);

  // Loop through each vertical column on screen
  for (let x = 0; x < screenWidth; x += RAY_STEP) {
    // --- 1. Calculate Ray Direction ---
    // cameraX ranges from -1 (left) to 1 (right)
    const cameraX = (2 * x) / screenWidth - 1;
    const rayDirX = cosAngle + planeX * cameraX;
    const rayDirY = sinAngle + planeY * cameraX;

    // --- 2. Which cell is the player currently in? ---
    let mapX = (player.x / TILE_SIZE) | 0;
    let mapY = (player.y / TILE_SIZE) | 0;

    // --- 3. Ray Travel Distance Between Gridlines ---
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    // --- 4. Step Direction + Initial Side Distances ---
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

    // --- 5. DDA: Step Through Grid Until Wall Hit ---
    let hit = false;
    let side = 0; // 0 = vertical wall, 1 = horizontal wall

    while (!hit) {
      // Step to next gridline in X or Y (whichever is closer)
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      // If we hit a wall cell (value 1), stop
      if (map[mapY] && map[mapY][mapX] === 1) hit = true;
    }

    // --- 6. Perpendicular Distance to Wall ---
    // Avoids fisheye by using straight-line distance, not ray length
    let perpWallDist;
    if (side === 0) {
      perpWallDist = (mapX - player.x / TILE_SIZE + (1 - stepX) / 2) / rayDirX;
    } else {
      perpWallDist = (mapY - player.y / TILE_SIZE + (1 - stepY) / 2) / rayDirY;
    }

    // Prevent divide-by-zero or negative values
    if (perpWallDist <= 0) perpWallDist = 0.01;

    // --- 7. Calculate Wall Height Based on Distance ---
    const wallHeight = Math.floor(screenHeight / perpWallDist);

    // Clamp top and bottom of wall slice
    const wallStart = Math.max(0, Math.floor((screenHeight - wallHeight) / 2));
    const wallEnd = Math.min(
      screenHeight,
      Math.ceil((screenHeight + wallHeight) / 2)
    );

    // --- 8. Draw Vertical Slice ---
    // Shade horizontal vs vertical walls differently
    context.fillStyle = side === 0 ? "#cccccc" : "#888888";
    context.fillRect(x, wallStart, RAY_STEP, wallEnd - wallStart);
  }
};
