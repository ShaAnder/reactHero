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

/* 
🔍 How the Minimap Works (Math Breakdown)

In a raycasting engine, the world is built from tiles on a 2D grid (like squares on graph paper). The player moves in continuous pixel space, but the map is laid out in discrete tile units (64x64 pixels in this game). The minimap is just a small top-down view of this 2D world, rendered in a corner of the screen. It’s a great tool for debugging and spatial awareness.

Here’s how the minimap is built and how the math behind it works:

🎯 Scaling the World to the Minimap

The full map uses tiles of size 64 pixels (TILE_SIZE = 64). But for the minimap, we want it smaller and unobtrusive — so we use:

const MINIMAP_TILE_SIZE = 9;

This means every 64px tile in the game world becomes just 9px on the minimap — that’s our scaling factor.

🧽 Positioning the Player

The player’s position is stored in pixel coordinates. To place them on the minimap, we convert from world space to minimap space like this:

const playerTileX = player.x / TILE_SIZE;
const playerTileY = player.y / TILE_SIZE;
const playerMinimapX = minimapX + playerTileX * MINIMAP_TILE_SIZE;
const playerMinimapY = minimapY + playerTileY * MINIMAP_TILE_SIZE;

This math:

Finds which tile the player is standing on by dividing their position by TILE_SIZE.

Scales that tile position down using MINIMAP_TILE_SIZE.

Offsets it by the minimap’s top-left corner (minimapX, minimapY) so it draws in the correct location.

🧱 Drawing the Tiles

Each tile is drawn using this:

context.fillStyle = MAP[row][col] === 1 ? "#222" : "#fff";
context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);

If the tile is a wall (1), we use a dark gray.

If it’s empty space (0), we use white.

We calculate drawX and drawY with simple grid math:

const drawX = minimapX + col * MINIMAP_TILE_SIZE;
const drawY = minimapY + row * MINIMAP_TILE_SIZE;

This means: for each column/row in the map, draw a square in the corresponding position on the minimap.

🧽 Drawing the Player’s Direction

To show which way the player is facing, we draw a short red line. The line starts at the player’s position and points outward in the direction they’re looking:

context.lineTo(
  playerMinimapX + Math.cos(player.angle) * MINIMAP_TILE_SIZE,
  playerMinimapY + Math.sin(player.angle) * MINIMAP_TILE_SIZE
);

Here’s the breakdown:

player.angle is the direction the player is facing (in radians).

Math.cos(angle) gives us the x-component of the direction.

Math.sin(angle) gives us the y-component.

This effectively converts the angle into a direction vector, then scales it and draws a line from the player’s position.

Think of it like this:

cos(angle) tells you how far to go left/right.

sin(angle) tells you how far to go up/down.

Together they give you a short “arrow” showing the player's direction.

✅ Summary

The minimap is just a scaled-down 2D version of the game world.

We convert pixel coordinates to tile coordinates by dividing by TILE_SIZE.

We convert world space to minimap space using a consistent scaling factor.

Direction is visualized with simple trigonometry (cos/sin of angle).

This makes it easy to see the map layout and where the player is facing.


*/
