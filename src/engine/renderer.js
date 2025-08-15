// Minimap overlay (top‑down view)
import { renderMinimap } from "./rendering/miniMapRenderer";
// Core wall / perspective renderer
import { rayCaster } from "./rendering/raycaster";
// Field of view constant
import { FOV_ANGLE } from "../../gameConfig";
// Camera plane math helper
import { getCameraPlane } from "../helpers/getCameraPlane";

// Draw just the 3D scene (walls) using the raycasting pipeline.
// We figure out the camera plane (how wide the vision fan is) and pass
// everything to the low‑level rayCaster which does the heavy lifting.
export const renderRaycaster = (context, player, map) => {
	const screenWidth = context.canvas.width;
	const screenHeight = context.canvas.height;
	const aspectRatio = screenWidth / screenHeight;

	// Field of view in radians (60° is a classic comfortable FOV)
	const FOV = FOV_ANGLE;

	// The camera plane is a perpendicular vector that controls how wide
	// the rays fan out across the screen (the perceived FOV).
	const { planeX, planeY } = getCameraPlane(player.angle, FOV, aspectRatio);

	// Ask the core rayCaster to fill in the vertical wall slices
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

// Master per‑frame render: 3D scene first, then overlays (minimap etc.).
export const render = (context, player, map) => {
	// Render the 3D environment
	renderRaycaster(context, player, map);
	// Render the small scrolling minimap in a corner
	renderMinimap(context, player, map);
};

/*
HOW THIS FILE WORKS

This module is the “director” for everything drawn each frame. It keeps
policy (what gets drawn, and in what order) separate from the low‑level
pixel math.

Flow each frame:
1. Compute the camera plane vector from the player’s angle + FOV so the
   ray caster knows how the screen maps to world directions.
2. Call rayCaster – it shoots one vertical ray per screen column, finds
   wall hit distances, and paints vertical slices (classic Wolf3D style).
3. Draw the minimap overlay so you can still orient yourself or debug
   generation.

Why keep this thin?
- Easier to add more overlay layers later (HUD, entities, particles).
- Lets us refactor internal rendering (e.g. sprites) without touching
  game loop code.

Future extension ideas:
- Add a world object so render({context, world}) can include enemies.
- Conditional minimap (only in dev or when a key is held).
*/
