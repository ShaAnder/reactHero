// Import the minimap renderer
import { renderMinimap } from "./rendering/miniMapRenderer";

// Import the core 3D raycasting renderer
import { rayCaster } from "./rendering/raycaster";

// Game constants (field of view, etc.)
import { FOV_ANGLE } from "../constants/gameConfig";

// Utility to calculate the camera plane based on player angle and FOV
import { getCameraPlane } from "../helpers/getCameraPlane";

// This function sets up and runs the raycasting engine to draw the 3D scene.
// It calculates the camera plane (which determines the FOV and how wide the rays fan out),
// then calls the rayCaster to actually render the 3D view.
export const renderRaycaster = (context, player, map) => {
	const screenWidth = context.canvas.width;
	const screenHeight = context.canvas.height;
	const aspectRatio = screenWidth / screenHeight;

	// Field of view in radians (60 degrees is a common default)
	const FOV = FOV_ANGLE;

	// The camera plane is perpendicular to the player's view direction.
	// It controls how wide the FOV is and is scaled by the aspect ratio.
	const { planeX, planeY } = getCameraPlane(player.angle, FOV, aspectRatio);

	// Run the raycasting renderer to draw walls and perspective-correct geometry
	rayCaster({
		player,
		planeX,
		planeY,
		screenWidth,
		screenHeight,
		map,
		context,
	});
};

// Main rendering function called every frame.
// It handles both the 3D scene and the top-down minimap.
export const render = (context, player, map) => {
	renderRaycaster(context, player, map); // Render the 3D environment
	renderMinimap(context, player, map); // Draw minimap overlay for debug/navigation
};

/*
How this file works:

This is the top-level rendering system, called every frame to update the visuals.

Here's the flow:
1. `renderRaycaster()`:
  - Calculates the FOV and camera plane based on the player's angle and the screen's aspect ratio.
  - Passes everything to `rayCaster()`, which handles the actual 3D wall rendering using raycasting.
2. `renderMinimap()`:
  - Draws a top-down 2D view of the map and the player's position.
  - Useful for debugging and helping the player navigate.

Think of this file as the "director" of rendering: it doesn't do the drawing itself, but tells the raycaster and minimap when and how to render each frame. As the game grows, this is where you'd add more features like enemies, pickups, or HUD elements, but for now it gives you a clean, foundational render loop[1][2][3][4][5][6][7][8].
*/
