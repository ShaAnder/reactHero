import {
  TILE_SIZE,
  MAP_NUM_ROWS,
  MAP_NUM_COLS,
} from "../../constants/gameConfig";
import { MAP } from "../../constants/map";

/**
 * Renders a minimap that follows the player and only shows part of the map around them.
 * The minimap is drawn in the top-right corner of the main game canvas.
 *
 * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
 * @param {Object} player - The player object, with x and y position (in pixels).
 */
export const renderMinimap = (context, player) => {
  // How many tiles away from the player to show (in all directions)
  const VISIBLE_RADIUS = 5;

  // Each tile on the minimap will be this many pixels wide/tall
  const MINIMAP_TILE_SIZE = 9;

  // How far from the right/top edge of the main canvas to put the minimap
  const MINIMAP_MARGIN = 20;

  // The minimap is a square. This is its width/height in pixels.
  const minimapDiameter = VISIBLE_RADIUS * 3 * MINIMAP_TILE_SIZE;

  // The player's position in the world, in pixels (not tiles)
  const playerWorldX = player.x;
  const playerWorldY = player.y;

  // Where to actually draw the minimap on the main canvas (top-right corner)
  const minimapX = context.canvas.width - minimapDiameter - MINIMAP_MARGIN;
  const minimapY = MINIMAP_MARGIN;

  // Figure out what part of the world the minimap should show
  // We want the player to be centered, so the top-left of the minimap in world-pixel coords is:
  const worldLeft = playerWorldX - VISIBLE_RADIUS * TILE_SIZE;
  const worldTop = playerWorldY - VISIBLE_RADIUS * TILE_SIZE;

  // --- Draw minimap background (just a dark square for contrast) ---
  context.fillStyle = "#111";
  context.fillRect(minimapX, minimapY, minimapDiameter, minimapDiameter);

  // --- Draw a border around the minimap (so it's visually distinct) ---
  context.lineWidth = 2;
  context.strokeStyle = "black";
  context.strokeRect(minimapX, minimapY, minimapDiameter, minimapDiameter);

  // --- CLIP: Don't let anything escape the minimap's bounds ---
  // This makes sure tiles/player/etc. never draw outside the minimap's border
  context.save();
  context.beginPath();
  context.rect(minimapX, minimapY, minimapDiameter, minimapDiameter);
  context.clip();

  // --- Draw the visible map tiles ---
  // We loop over every tile in the full map, but only draw those that are within the minimap's view
  for (let row = 0; row < MAP_NUM_ROWS; row++) {
    for (let col = 0; col < MAP_NUM_COLS; col++) {
      // The top-left corner of this tile in world pixels
      const tileWorldX = col * TILE_SIZE;
      const tileWorldY = row * TILE_SIZE;

      // To figure out where this tile should go on the minimap:
      // - Subtract the worldLeft/worldTop (so the minimap's top-left is 0,0)
      // - Divide by TILE_SIZE to get tile units
      // - Multiply by MINIMAP_TILE_SIZE to scale to minimap pixels
      // - Add minimapX/minimapY to shift into minimap's position on the main canvas
      const drawX =
        minimapX + ((tileWorldX - worldLeft) / TILE_SIZE) * MINIMAP_TILE_SIZE;
      const drawY =
        minimapY + ((tileWorldY - worldTop) / TILE_SIZE) * MINIMAP_TILE_SIZE;

      // If this tile is completely outside the minimap, skip it for performance
      if (
        drawX + MINIMAP_TILE_SIZE < minimapX ||
        drawX > minimapX + minimapDiameter ||
        drawY + MINIMAP_TILE_SIZE < minimapY ||
        drawY > minimapY + minimapDiameter
      ) {
        continue;
      }

      // Draw the tile: dark for wall, light for empty
      context.fillStyle = MAP[row][col] === 1 ? "#222" : "#fff";
      context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
    }
  }

  // --- Draw the player ---
  // The player is always at the center of the minimap, regardless of their world position
  const playerMinimapX = minimapX + minimapDiameter / 2;
  const playerMinimapY = minimapY + minimapDiameter / 2;

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

  // --- Restore the context to remove the clipping region ---
  context.restore();
};
