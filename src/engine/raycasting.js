import { TILE_SIZE } from "../constants/gameConfig";

/**
 * Casts rays from the player’s perspective across the screen using DDA.
 * For now, it just draws debug lines from the player to the wall hit points.
 *
 * This function basically answers: "If I'm looking in a direction, where is the first wall I hit?"
 * It loops over the screen pixel-by-pixel horizontally, and for each vertical stripe,
 * it casts a ray in the world to find where it hits a wall.
 */
export const rayCaster = ({
  player,
  planeX,
  planeY,
  screenWidth,
  // use later
  screenHeight,
  map,
  context,
}) => {
  // Loop over each vertical slice of the screen (i.e., imagine drawing 1 vertical line per pixel)
  for (let x = 0; x < screenWidth; x++) {
    // === STEP 1: Set up the camera plane projection ===

    // cameraX maps our screen's x-coordinate to a value between -1 and +1.
    // This determines how far left/right of center we're casting from.
    // -1 = far left, 0 = center of screen, +1 = far right
    const cameraX = (2 * x) / screenWidth - 1;

    // rayDir represents the direction this ray is pointing in world space.
    // It's our player direction, plus some offset based on which slice of the screen this is.
    // This way we cast a unique ray per vertical screen column.
    const rayDirX = Math.cos(player.angle) + planeX * cameraX;
    const rayDirY = Math.sin(player.angle) + planeY * cameraX;

    // === STEP 2: Get the map tile we're starting from ===

    // This just finds which tile the player is inside (based on their pixel position)
    // e.g., if TILE_SIZE is 64 and we're at x=128, we're in tile index 2 (128/64)
    let mapX = Math.floor(player.x / TILE_SIZE);
    let mapY = Math.floor(player.y / TILE_SIZE);

    // === STEP 3: Calculate distance to next tile boundary ===

    // These tell us how far we need to move along the ray to cross 1 tile horizontally or vertically.
    // Think of it like: "how much do I need to move before I hit the next vertical or horizontal line?"
    // Steeper rays will have larger X distances and smaller Y distances (and vice versa).
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    // These will be set depending on which way the ray is facing (left/right or up/down)
    let stepX, stepY;
    let sideDistX, sideDistY;

    // === STEP 4: Work out step direction and initial side distances ===

    // X-direction
    if (rayDirX < 0) {
      // Ray is going left, so we’ll step to the left tile each time (i.e., -1)
      stepX = -1;
      // How far from the player's current x position to the **left side** of the current tile
      sideDistX = (player.x / TILE_SIZE - mapX) * deltaDistX;
    } else {
      // Ray is going right, so we step to the next tile to the right
      stepX = 1;
      // How far to the **right side** of the tile
      sideDistX = (mapX + 1.0 - player.x / TILE_SIZE) * deltaDistX;
    }

    // Y-direction (same logic)
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y / TILE_SIZE - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - player.y / TILE_SIZE) * deltaDistY;
    }

    // === STEP 5: DDA — step through the grid until we hit something ===

    // "hit" becomes true once we find a wall
    let hit = false;
    // side tells us whether the wall was hit from the x-side (vertical wall) or y-side (horizontal wall)
    let side = 0;

    // Loop until we hit a wall
    while (!hit) {
      // Compare the current distance to the next vertical vs horizontal line
      // Move in whichever direction is shorter (closest wall)
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX; // Add another tile’s worth of distance
        mapX += stepX; // Step to the next tile in X direction
        side = 0; // Mark that this was a vertical wall hit
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1; // Horizontal wall hit
      }

      // Check if the new tile is actually a wall (value === 1)
      // If so, stop tracing this ray
      if (map[mapY] && map[mapY][mapX] === 1) {
        hit = true;
      }
    }

    // === STEP 6: Draw a debug line from player to wall ===

    // We hit a wall! Now we draw a line from player position to the center of that wall tile.
    // (Just for visual debug purposes)
    const hitX = mapX * TILE_SIZE + TILE_SIZE / 2;
    const hitY = mapY * TILE_SIZE + TILE_SIZE / 2;

    context.strokeStyle = "rgba(255, 255, 0, 0.3)";
    context.beginPath();
    context.moveTo(player.x, player.y);
    context.lineTo(hitX, hitY);
    context.stroke();

    // Later, instead of drawing this debug line, we’ll actually use the wall distance
    // to draw a vertical strip that simulates depth — like Wolfenstein or DOOM!
  }
};
