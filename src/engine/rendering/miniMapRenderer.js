import { TILE_SIZE } from "../../constants/gameConfig";
import { MAP_NUM_ROWS, MAP_NUM_COLS, MAP } from "../../constants/map";

/**
 * Renders a scrolling minimap centered on the player.
 * Only a small portion of the map is shown at a time, and it moves with the player.
 *
 * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
 * @param {Object} player - The player object, with x, y (in pixels) and angle (in radians).
 */
export const renderMinimap = (context, player) => {
  const MINIMAP_TILE_SIZE = 9;
  const VIEWPORT_TILES = 15;
  const MINIMAP_SIZE = VIEWPORT_TILES * MINIMAP_TILE_SIZE;
  const MINIMAP_MARGIN = 20;

  const minimapX = context.canvas.width - MINIMAP_SIZE - MINIMAP_MARGIN;
  const minimapY = MINIMAP_MARGIN;

  // Minimap background
  context.fillStyle = "#111";
  context.fillRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

  // Clip overflow
  context.save();
  context.beginPath();
  context.rect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);
  context.clip();

  // --- Center camera on player (in tile units, including fractional) ---
  const cameraCenterTileX = player.x / TILE_SIZE;
  const cameraCenterTileY = player.y / TILE_SIZE;

  const topLeftTileX = cameraCenterTileX - VIEWPORT_TILES / 2;
  const topLeftTileY = cameraCenterTileY - VIEWPORT_TILES / 2;

  const startCol = Math.floor(topLeftTileX);
  const startRow = Math.floor(topLeftTileY);

  // Sub-tile pixel offset (how far into the tile we're scrolled)
  const offsetX = (topLeftTileX - startCol) * MINIMAP_TILE_SIZE;
  const offsetY = (topLeftTileY - startRow) * MINIMAP_TILE_SIZE;

  // Loop only visible area
  for (let row = 0; row <= VIEWPORT_TILES; row++) {
    for (let col = 0; col <= VIEWPORT_TILES; col++) {
      const mapRow = startRow + row;
      const mapCol = startCol + col;

      if (
        mapRow < 0 ||
        mapRow >= MAP_NUM_ROWS ||
        mapCol < 0 ||
        mapCol >= MAP_NUM_COLS
      )
        continue;

      const tileType = MAP[mapRow][mapCol];

      // Position on minimap (with subpixel scroll correction)
      const drawX = minimapX + col * MINIMAP_TILE_SIZE - offsetX;
      const drawY = minimapY + row * MINIMAP_TILE_SIZE - offsetY;

      context.fillStyle = tileType === 1 ? "#222" : "#fff";
      context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
    }
  }

  context.restore(); // remove clip

  // Draw minimap border
  context.lineWidth = 2;
  context.strokeStyle = "black";
  context.strokeRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

  // --- Player in center ---
  const centerX = minimapX + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;
  const centerY = minimapY + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;

  context.fillStyle = "red";
  context.beginPath();
  context.arc(centerX, centerY, MINIMAP_TILE_SIZE / 2, 0, Math.PI * 2);
  context.fill();

  // Player facing direction
  context.strokeStyle = "red";
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.lineTo(
    centerX + Math.cos(player.angle) * MINIMAP_TILE_SIZE,
    centerY + Math.sin(player.angle) * MINIMAP_TILE_SIZE
  );
  context.stroke();
};
