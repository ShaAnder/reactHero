// Import the minimap renderer
import { renderMinimap } from "./rendering/miniMapRenderer";
// Import the core 3D raycasting renderer
import { rayCaster } from "./rendering/raycaster";

// Game constants (field of view, etc.)
import { FOV_ANGLE } from "../constants/gameConfig";
import { MAP } from "../constants/map";

// Utility to calculate the camera plane based on player angle and FOV
import { getCameraPlane } from "../helpers/getCameraPlane";

/**
 * Sets up and runs the raycasting engine to draw the 3D scene.
 *
 * @param {CanvasRenderingContext2D} context - The canvas drawing context.
 * @param {Object} player - Player object containing position and view angle.
 */
export const renderRaycaster = (context, player) => {
  const screenWidth = context.canvas.width;
  const screenHeight = context.canvas.height;
  const aspectRatio = screenWidth / screenHeight;

  // Field of view in radians (60 degrees is a common default)
  const FOV = (60 * Math.PI) / 180;

  // The camera plane defines how wide the rays spread from the player’s view direction.
  // It’s perpendicular to the direction the player is facing, and scaled by FOV and aspect ratio.
  //
  // Imagine the player’s view as a triangle shooting forward.
  // The camera plane defines the base of that triangle — how wide the ray directions fan out.
  const { planeX, planeY } = getCameraPlane(player.angle, FOV, aspectRatio);

  // Run the raycasting renderer to draw walls and perspective-correct geometry
  rayCaster({
    player,
    planeX,
    planeY,
    screenWidth,
    screenHeight,
    map: MAP,
    context,
  });
};

/**
 * Main rendering function called every frame.
 * It handles both the 3D scene and the top-down minimap.
 *
 * @param {CanvasRenderingContext2D} context - The canvas drawing context.
 * @param {Object} player - Player state including position and facing angle.
 */
export const render = (context, player) => {
  renderRaycaster(context, player); // Render the 3D environment
  renderMinimap(context, player); // Draw minimap overlay for debug/navigation
};

/** how this works:
 *
 * This is your top-level rendering system — called every frame!
 *
 * Here's what it's doing:
 * 1. `renderRaycaster()`:
 *    - Calculates how wide the FOV should be based on screen shape (aspect ratio).
 *    - Uses the player’s current angle to figure out the direction they’re facing.
 *    - Constructs a "camera plane" to spread out rays for that wide-angle view.
 *    - Passes everything to the `rayCaster()` to handle actual 3D drawing.
 *
 * 2. `renderMinimap()`:
 *    - Draws a top-down 2D view of the map and the player.
 *    - Great for debugging or giving the player a sense of navigation.
 *
 * Think of this file as the director. It doesn't do the drawing itself,
 * but it tells the raycaster and minimap systems when and how to render.
 *
 * Eventually, you'll probably have more stuff here — enemies, pickups, HUD, etc.
 * But for now, this gives you the foundational loop to paint each frame.
 */
