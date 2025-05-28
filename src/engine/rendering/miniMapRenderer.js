import {
  TILE_SIZE,
  MAP_NUM_ROWS,
  MAP_NUM_COLS,
} from "../../constants/gameConfig";
import { MAP } from "../../constants/map";

/**
 * Draws a minimap in the top-right corner of the game.
 * Shows the full map and player’s position/direction.
 *
 * @param {CanvasRenderingContext2D} context - The canvas drawing context
 * @param {Object} player - Player's current position (x, y in pixels)
 */
export const renderMinimap = (context, player) => {
  // Size of each tile on the minimap
  const MINIMAP_TILE_SIZE = 9;

  // Padding from the canvas edge
  const MINIMAP_MARGIN = 20;

  // Total minimap size in pixels
  const minimapWidth = MAP_NUM_COLS * MINIMAP_TILE_SIZE;
  const minimapHeight = MAP_NUM_ROWS * MINIMAP_TILE_SIZE;

  // Top-right corner position for minimap
  const minimapX = context.canvas.width - minimapWidth - MINIMAP_MARGIN;
  const minimapY = MINIMAP_MARGIN;

  // Draw dark background for contrast
  context.fillStyle = "#111";
  context.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);

  // Outline the minimap with a border
  context.lineWidth = 2;
  context.strokeStyle = "black";
  context.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);

  // Draw each tile: dark = wall, white = empty
  for (let row = 0; row < MAP_NUM_ROWS; row++) {
    for (let col = 0; col < MAP_NUM_COLS; col++) {
      const drawX = minimapX + col * MINIMAP_TILE_SIZE;
      const drawY = minimapY + row * MINIMAP_TILE_SIZE;
      context.fillStyle = MAP[row][col] === 1 ? "#222" : "#fff";
      context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
    }
  }

  // Convert player world coords to minimap coords
  const playerTileX = player.x / TILE_SIZE;
  const playerTileY = player.y / TILE_SIZE;
  const playerMinimapX = minimapX + playerTileX * MINIMAP_TILE_SIZE;
  const playerMinimapY = minimapY + playerTileY * MINIMAP_TILE_SIZE;

  // Draw player as a red dot
  context.fillStyle = "red";
  context.beginPath();
  context.arc(
    playerMinimapX,
    playerMinimapY,
    MINIMAP_TILE_SIZE / 2,
    0,
    Math.PI * 2
  );
  context.fill();

  // Draw a short line showing player’s facing direction
  context.strokeStyle = "red";
  context.beginPath();
  context.moveTo(playerMinimapX, playerMinimapY);
  context.lineTo(
    playerMinimapX + Math.cos(player.angle) * MINIMAP_TILE_SIZE,
    playerMinimapY + Math.sin(player.angle) * MINIMAP_TILE_SIZE
  );
  context.stroke();
};
