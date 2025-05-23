// Import the minimap rendering function
import { renderMinimap } from "./rendering/miniMapRenderer";
// Import the main raycasting rendering function
import { rayCaster } from "./rendering/raycaster";

// Import game configuration constants (Field of View angle)
import { FOV_ANGLE } from "../constants/gameConfig";
// Import the map layout
import { MAP } from "../constants/map";

// Import a helper to calculate the camera plane based on player angle and FOV
import { getCameraPlane } from "../helpers/getCameraPlane";

/**
 * Sets up and calls the raycaster for the main 3D view.
 * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
 * @param {Object} player - The player object, containing position and angle.
 */
export const renderRaycaster = (context, player) => {
  // Get the width and height of the canvas (the screen)
  const screenWidth = context.canvas.width;
  const screenHeight = context.canvas.height;

  // Calculate the aspect ratio (width divided by height)
  const aspectRatio = screenWidth / screenHeight;

  // Set the field of view (FOV) in radians (here, 60 degrees)
  // Most math functions in JS use radians
  const FOV = (60 * Math.PI) / 180;

  // Calculate the camera plane (used to determine the spread of rays for FOV)
  // planeX and planeY are perpendicular to the player's viewing direction
  const { planeX, planeY } = getCameraPlane(player.angle, FOV, aspectRatio);

  // Call the raycaster function, which will:
  // - Cast rays for each column of the screen
  // - Calculate wall distances and heights
  // - Render the 3D scene onto the canvas
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
 * Main render function called each frame.
 * Renders the 3D scene and then overlays the minimap.
 * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
 * @param {Object} player - The player object, containing position and angle.
 */
export const render = (context, player) => {
  // Render the main 3D view using the raycaster
  renderRaycaster(context, player);

  // Render the minimap on top for reference/debugging
  renderMinimap(context, player);
};

/*

What does this file do?

Sets up the main 3D raycasting view and overlays a minimap.

Handles screen sizing, field of view, and camera plane calculations.

Delegates the heavy lifting of rendering to specialized modules.

Step-by-Step Breakdown
Screen and FOV Setup

Gets the canvas dimensions and aspect ratio.

Converts FOV from degrees to radians for math functions.

Camera Plane Calculation

Uses the player's angle and FOV to compute the camera plane.

The camera plane is perpendicular to the player's direction and determines how wide the field of view is.

Raycasting

Calls rayCaster, passing all the necessary info:

Player position and angle

Camera plane (for FOV)

Screen dimensions

Map layout

Drawing context

The raycaster:

Casts a ray for each column of the screen.

Calculates where each ray hits a wall and how far it travels.

Uses this distance to draw a vertical slice of wall, creating the 3D effect.

Minimap Rendering

After the main scene, draws a 2D top-down minimap overlay for reference.

Key Math Concepts Involved
Aspect Ratio: Ensures the FOV looks correct on any screen shape.

Radians: Trigonometric functions (sin, cos) require angles in radians.

Camera Plane: A vector perpendicular to the player's direction, scaled by FOV and aspect ratio, used to spread rays across the screen.

Ray Direction: For each screen column, a unique direction is calculated using the player’s direction and the camera plane, ensuring rays fan out evenly across the FOV.

How It All Fits Together
The player’s position and viewing angle set the starting point and direction.

The camera plane determines the left and right limits of the FOV.

Each screen column gets a ray, which is cast into the world to see what it hits.

The distance to the first wall hit by each ray determines how tall the wall appears on screen.

The minimap gives a top-down view for orientation and debugging.

*/
