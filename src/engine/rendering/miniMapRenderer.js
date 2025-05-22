import {
  TILE_SIZE,
  MAP_NUM_ROWS,
  MAP_NUM_COLS,
} from "../../constants/gameConfig";
import { MAP } from "../../constants/map";

/**
 * Renders a minimap that shows the entire map and the player's position within it.
 * The minimap is drawn in the top-right corner of the main game canvas.
 *
 * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
 * @param {Object} player - The player object, with x and y position (in pixels).
 */
export const renderMinimap = (context, player) => {
  // Each tile on the minimap will be this many pixels wide/tall
  const MINIMAP_TILE_SIZE = 9;

  // How far from the right/top edge of the main canvas to put the minimap
  const MINIMAP_MARGIN = 20;

  // The minimap's width and height in pixels (covers the whole map)
  const minimapWidth = MAP_NUM_COLS * MINIMAP_TILE_SIZE;
  const minimapHeight = MAP_NUM_ROWS * MINIMAP_TILE_SIZE;

  // Where to actually draw the minimap on the main canvas (top-right corner)
  const minimapX = context.canvas.width - minimapWidth - MINIMAP_MARGIN;
  const minimapY = MINIMAP_MARGIN;

  // --- Draw minimap background (just a dark square for contrast) ---
  context.fillStyle = "#111";
  context.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);

  // --- Draw a border around the minimap (so it's visually distinct) ---
  context.lineWidth = 2;
  context.strokeStyle = "black";
  context.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);

  // --- Draw the map tiles ---
  for (let row = 0; row < MAP_NUM_ROWS; row++) {
    for (let col = 0; col < MAP_NUM_COLS; col++) {
      // The top-left corner of this tile on the minimap
      const drawX = minimapX + col * MINIMAP_TILE_SIZE;
      const drawY = minimapY + row * MINIMAP_TILE_SIZE;

      // Draw the tile: dark for wall, light for empty
      context.fillStyle = MAP[row][col] === 1 ? "#222" : "#fff";
      context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
    }
  }

  // --- Draw the player ---
  // Convert player world position (pixels) to minimap position
  const playerTileX = player.x / TILE_SIZE;
  const playerTileY = player.y / TILE_SIZE;
  const playerMinimapX = minimapX + playerTileX * MINIMAP_TILE_SIZE;
  const playerMinimapY = minimapY + playerTileY * MINIMAP_TILE_SIZE;

  // Draw the player as a red dot
  context.fillStyle = "red";
  context.beginPath();
  context.arc(
    playerMinimapX,
    playerMinimapY,
    MINIMAP_TILE_SIZE / 2, // radius of the player dot
    0,
    Math.PI * 2
  );
  context.fill();

  // Draw a line showing which way the player is facing
  // This is just a short line starting at the player dot, pointing in the direction of player.angle
  context.strokeStyle = "red";
  context.beginPath();
  context.moveTo(playerMinimapX, playerMinimapY);
  context.lineTo(
    playerMinimapX + Math.cos(player.angle) * MINIMAP_TILE_SIZE,
    playerMinimapY + Math.sin(player.angle) * MINIMAP_TILE_SIZE
  );
  context.stroke();
};
