import { TILE_SIZE } from "../../../gameConfig";
import { DEBUG_FLAGS } from "../../constants/debugConfig";
import { log } from "../../utils/logger";

// Raycasting: cast one ray per screen column, find wall hit, draw vertical slice.
// Tips: tweak RAY_STEP for perf; depth buffer used later for sprites.

export const rayCaster = ({
	player,
	planeX,
	planeY,
	screenWidth,
	screenHeight,
	map,
	context,
	depthBuffer, // optional preallocated array to fill
}) => {
	// No map? skip
	if (!map || !Array.isArray(map) || !map.length) {
		return;
	}

	// Ray density (increase for speed, lower quality)
	const RAY_STEP = 1;

	// Precompute facing
	const cosAngle = Math.cos(player.angle);
	const sinAngle = Math.sin(player.angle);

	// Reuse or create depth buffer
	const localDepth = depthBuffer || new Array(screenWidth);

	// For each column
	for (let x = 0; x < screenWidth; x += RAY_STEP) {
		// Direction for this column (cameraX spans -1..1)
		const cameraX = (2 * x) / screenWidth - 1;
		const rayDirX = cosAngle + planeX * cameraX; // forward + lateral spread
		const rayDirY = sinAngle + planeY * cameraX;

		// Starting tile
		let mapX = (player.x / TILE_SIZE) | 0;
		let mapY = (player.y / TILE_SIZE) | 0;

		// Step lengths to next gridline
		const deltaDistX = Math.abs(1 / rayDirX);
		const deltaDistY = Math.abs(1 / rayDirY);

		// Step direction and initial distances
		let stepX, stepY, sideDistX, sideDistY;

		if (rayDirX < 0) {
			stepX = -1;
			sideDistX = (player.x / TILE_SIZE - mapX) * deltaDistX;
		} else {
			stepX = 1;
			sideDistX = (mapX + 1 - player.x / TILE_SIZE) * deltaDistX;
		}

		if (rayDirY < 0) {
			stepY = -1;
			sideDistY = (player.y / TILE_SIZE - mapY) * deltaDistY;
		} else {
			stepY = 1;
			sideDistY = (mapY + 1 - player.y / TILE_SIZE) * deltaDistY;
		}

		// Walk the grid until wall hit
		let hit = false;
		let side = 0; // 0 = X-side wall, 1 = Y-side wall

		while (!hit) {
			// Advance in X or Y
			if (sideDistX < sideDistY) {
				sideDistX += deltaDistX;
				mapX += stepX;
				side = 0;
			} else {
				sideDistY += deltaDistY;
				mapY += stepY;
				side = 1;
			}

			// Wall?
			if (
				map[mapY] != null &&
				Array.isArray(map[mapY]) &&
				map[mapY][mapX] === 1
			) {
				hit = true;
			}

			// Out of bounds guard
			if (map[mapY] && map[mapY][mapX] != null && map[mapY][mapX] === 1) {
				hit = true;
			}

			// Verbose warnings
			if (DEBUG_FLAGS.VERBOSE_RAYCAST_WARN) {
				if (!map[mapY] || !Array.isArray(map[mapY])) {
					log.warn("Ray", `Row ${mapY} is missing or not an array`, map[mapY]);
				}
				if (map[mapY] && map[mapY][mapX] == null) {
					log.warn(
						"Ray",
						`Cell [${mapY}][${mapX}] is missing`,
						map[mapY][mapX]
					);
				}
			}
		}

		// Perpendicular distance (avoid fisheye)
		let perpWallDist;
		if (side === 0) {
			perpWallDist = (mapX - player.x / TILE_SIZE + (1 - stepX) / 2) / rayDirX;
		} else {
			perpWallDist = (mapY - player.y / TILE_SIZE + (1 - stepY) / 2) / rayDirY;
		}

		// Avoid zero
		if (perpWallDist <= 0) perpWallDist = 0.01;

		// Distance -> slice height
		const wallHeight = Math.floor(screenHeight / perpWallDist);

		// Clamp slice
		const wallStart = Math.max(0, Math.floor((screenHeight - wallHeight) / 2));
		const wallEnd = Math.min(
			screenHeight,
			Math.ceil((screenHeight + wallHeight) / 2)
		);

		// Save depth
		localDepth[x] = perpWallDist;

		// Draw slice
		context.fillStyle = side === 0 ? "#cccccc" : "#888888"; // Shade side walls
		context.fillRect(x, wallStart, RAY_STEP, wallEnd - wallStart);
	}

	return localDepth;
};
/*
HOW THIS FUNCTION WORKS (plain + math side‑by‑side)

In short:
	1. For each vertical screen column we figure out what direction that column
		 is "looking" relative to where the player faces.
	2. We march forward through the square grid one whole cell boundary at a time
		 until we smack into a wall.
	3. We measure how far away that wall is (correcting angle distortion) and
		 draw a taller bar if it’s close, shorter if it’s far.
	4. We remember the distance for that column so later things (enemies, items)
		 can be hidden if they’re behind that wall.

Key math translated:
	Mapping column to direction:
		cameraX ∈ [-1, +1] = horizontal position across the screen.
		rayDir = forwardDir + cameraPlane * cameraX
		(Think: start looking straight, then swivel left or right proportionally.)

	DDA stepping distances:
		We want: how far along the ray until we cross a vertical grid line?
		If rayDirX is how much X changes per unit of travel, then distance needed
		so X moves exactly 1 tile is 1 / |rayDirX|  → deltaDistX.
		Same logic for Y gives deltaDistY.
		We keep two running costs (sideDistX, sideDistY) and always advance the
		smaller → guarantees no skipped cells.

	Perpendicular (fish‑eye corrected) distance:
		Rays at screen edges travel a longer diagonal to reach the same wall face.
		We only want straight‑on distance so wall widths stay consistent. Using the
		axis we just crossed, we solve a simple linear equation for t (time along
		the ray) and that becomes perpWallDist.

	Wall slice height:
		Big idea: farther = looks smaller. We mimic perspective by:
			wallHeight ≈ screenHeight / perpWallDist
		So doubling distance halves the on‑screen slice height (roughly eye biology).

	Depth buffer:
		depth[column] = perpWallDist so a later sprite pass can do:
			if (spriteDistance < depth[column]) drawPixel(); else skip;
		That’s how we avoid sprites poking through walls.

Why the correction matters:
	Without using the "perpendicular" distance everything curves and stretches
	at the edges (classic fish‑eye). The simple division using the axis stepped
	keeps straight halls straight.

Performance summary:
	- One sin/cos per frame, not per column.
	- Integer-ish grid jumps (no tiny floating drift).
	- O(screenWidth) complexity; scale RAY_STEP to trade detail vs speed.

Next extensions (when you need them):
	- Textures: compute exact wall hit coordinate (fractional X/Y) to sample.
	- Sprites: project entity position to screen (like inverse of ray), compare depth.
	- Lighting/fog: darken color by distance (e.g. shade = 1/(1+k*dist)).
	- Wider FOV: adjust cameraPlane length; math stays identical.
*/
