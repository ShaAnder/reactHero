// Core wall / perspective renderer (low-level pass only now)
import { rayCaster } from "./rendering/raycaster";
import { FOV_ANGLE } from "../../gameConfig"; // Field of view constant
import { getCameraPlane } from "../helpers/getCameraPlane"; // Camera plane math helper

// Draw just the 3D scene (walls) using the raycasting pipeline.
// We figure out the camera plane (how wide the vision fan is) and pass
// everything to the low‑level rayCaster which does the heavy lifting.
export const renderRaycaster = (context, player, map, outDepth) => {
	const screenWidth = context.canvas.width;
	const screenHeight = context.canvas.height;
	const aspectRatio = screenWidth / screenHeight;

	// Field of view in radians (60° is a classic comfortable FOV)
	const FOV = FOV_ANGLE;

	// The camera plane is a perpendicular vector that controls how wide
	// the rays fan out across the screen (the perceived FOV).
	const { planeX, planeY } = getCameraPlane(player.angle, FOV, aspectRatio);

	// Ask the core rayCaster to fill in the vertical wall slices
	return rayCaster({
		player,
		planeX,
		planeY,
		screenWidth,
		screenHeight,
		map,
		context,
		depthBuffer: outDepth,
	});
};

/*
renderer.js now only exposes renderRaycaster (pure 3D walls pass).
Full frame assembly moved to rendering/renderWorld.js.

Future: expose depth buffer for sprite/entity sorting.
*/
