import { TILE_SIZE } from "../../constants/gameConfig";

/**
 * Renders a scrolling minimap centered on the player.
 * Only a small portion of the map is shown at a time, and it moves with the player.
 *
 * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
 * @param {Object} player - The player object, with x, y (in pixels) and angle (in radians).
 */
export const renderMinimap = (context, player, map) => {
  if (!map || !map.length || !map[0].length) return;

  const MINIMAP_TILE_SIZE = 9;
  const VIEWPORT_TILES = 15;
  const MINIMAP_SIZE = VIEWPORT_TILES * MINIMAP_TILE_SIZE;
  const MINIMAP_MARGIN = 20;

  // Dynamic map dimensions
  const MAP_NUM_ROWS = map.length;
  const MAP_NUM_COLS = map[0].length;

  // Set the minimap's top-left position in the canvas
  const minimapX = context.canvas.width - MINIMAP_SIZE - MINIMAP_MARGIN;
  const minimapY = MINIMAP_MARGIN;

  // Draw background box
  context.fillStyle = "#111";
  context.fillRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

  // Clip anything outside minimap area
  context.save();
  context.beginPath();
  context.rect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);
  context.clip();

  // --- Center camera on player (in tile units) ---
  const cameraCenterTileX = player.x / TILE_SIZE;
  const cameraCenterTileY = player.y / TILE_SIZE;

  const topLeftTileX = cameraCenterTileX - VIEWPORT_TILES / 2;
  const topLeftTileY = cameraCenterTileY - VIEWPORT_TILES / 2;

  const startCol = Math.floor(topLeftTileX);
  const startRow = Math.floor(topLeftTileY);

  // Sub-tile offset to allow smooth scrolling
  const offsetX = (topLeftTileX - startCol) * MINIMAP_TILE_SIZE;
  const offsetY = (topLeftTileY - startRow) * MINIMAP_TILE_SIZE;

  // Loop through only the tiles visible in the viewport
  for (let row = 0; row <= VIEWPORT_TILES; row++) {
    for (let col = 0; col <= VIEWPORT_TILES; col++) {
      const mapRow = startRow + row;
      const mapCol = startCol + col;

      // Skip if outside map bounds
      if (
        mapRow < 0 ||
        mapRow >= MAP_NUM_ROWS ||
        mapCol < 0 ||
        mapCol >= MAP_NUM_COLS
      )
        continue;

      const tileType = map[mapRow][mapCol];

      // Convert to pixel position on the minimap
      const drawX = minimapX + col * MINIMAP_TILE_SIZE - offsetX;
      const drawY = minimapY + row * MINIMAP_TILE_SIZE - offsetY;

      // Fill based on tile type (wall or floor)
      context.fillStyle = tileType === 1 ? "#222" : "#fff";
      context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
    }
  }

  context.restore(); // remove clip region

  // Draw a nice border around the minimap
  context.lineWidth = 2;
  context.strokeStyle = "black";
  context.strokeRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

  // --- Draw player in center of minimap ---
  const centerX = minimapX + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;
  const centerY = minimapY + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;

  context.fillStyle = "red";
  context.beginPath();
  context.arc(centerX, centerY, MINIMAP_TILE_SIZE / 2, 0, Math.PI * 2);
  context.fill();

  // Draw direction line (facing angle)
  context.strokeStyle = "red";
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.lineTo(
    centerX + Math.cos(player.angle) * MINIMAP_TILE_SIZE,
    centerY + Math.sin(player.angle) * MINIMAP_TILE_SIZE
  );
  context.stroke();
};

/** how this function works:
 *
 * This function renders a dynamic minimap that scrolls with the player.
 * It's basically a moving camera that shows only a small part of the world map.
 *
 * - Constants define the minimap size, zoom level, and screen offset.
 * - First we calculate where the minimap box will draw on the canvas.
 * - Then we figure out which tiles are visible based on the player’s current position.
 * - We clip anything outside the minimap boundary using canvas clipping.
 * - A loop draws only the visible tile data (wall vs floor).
 * - Sub-tile offsets are used to keep scrolling smooth (fractional tile movement).
 * - The player is drawn in the center with a dot and a line showing the direction they’re facing.
 *
 * Notes:
 * - The player's position is always centered.
 * - The minimap tiles are scaled down but accurately reflect the full map.
 * - This gives players a limited but informative top-down view of their surroundings.
 *
 */
