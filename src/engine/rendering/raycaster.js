import { TILE_SIZE } from "../../../gameConfig";

// Core raycasting renderer (classic Wolfenstein 3D style).
// One vertical column at a time: cast a ray, march through the grid with
// DDA until we hit a wall, compute distance, draw a vertical slice whose
// height is inversely proportional to that distance.
// DDA (Digital Differential Analyzer) is fast because it only advances to
// the next grid boundary – never overshooting or skipping cells.

export const rayCaster = ({
	player,
	planeX,
	planeY,
	screenWidth,
	screenHeight,
	map,
	context,
}) => {
	// Early out: no map yet
	if (!map || !Array.isArray(map) || !map.length) {
		return;
	}

	// Horizontal resolution of casting (1 = every pixel column)
	const RAY_STEP = 1;

	// Player facing as a unit vector (avoid re-computing cos/sin each column)
	const cosAngle = Math.cos(player.angle);
	const sinAngle = Math.sin(player.angle);

	// Loop over every vertical column on the screen
	for (let x = 0; x < screenWidth; x += RAY_STEP) {
		// 1) Ray direction for this screen column
		// cameraX: -1 (far left) → +1 (far right)
		const cameraX = (2 * x) / screenWidth - 1;
		// Combine forward direction with sideways camera plane component
		const rayDirX = cosAngle + planeX * cameraX;
		const rayDirY = sinAngle + planeY * cameraX;

		// 2) Starting cell (tile indices)
		let mapX = (player.x / TILE_SIZE) | 0;
		let mapY = (player.y / TILE_SIZE) | 0;

		// 3) Length the ray travels to cross one tile horizontally/vertically
		const deltaDistX = Math.abs(1 / rayDirX);
		const deltaDistY = Math.abs(1 / rayDirY);

		// 4) Initial step direction and first boundary distance
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

		// 5) Walk the grid one cell at a time until we hit a wall
		let hit = false;
		let side = 0; // 0 = X-side wall, 1 = Y-side wall

		while (!hit) {
			// Move to the next map square in X or Y direction
			if (sideDistX < sideDistY) {
				sideDistX += deltaDistX;
				mapX += stepX;
				side = 0;
			} else {
				sideDistY += deltaDistY;
				mapY += stepY;
				side = 1;
			}

			// Check if the ray hit a wall
			if (
				map[mapY] != null &&
				Array.isArray(map[mapY]) &&
				map[mapY][mapX] === 1
			) {
				hit = true;
			}

			// out of bounds
			if (map[mapY] && map[mapY][mapX] != null && map[mapY][mapX] === 1) {
				hit = true;
			}

			// debugging
			if (!map[mapY] || !Array.isArray(map[mapY])) {
				console.warn(`Row ${mapY} is missing or not an array:`, map[mapY]);
			}
			if (map[mapY] && map[mapY][mapX] == null) {
				console.warn(`Cell [${mapY}][${mapX}] is missing:`, map[mapY][mapX]);
			}
		}

		// 6) Perpendicular distance (removes fisheye distortion)
		let perpWallDist;
		if (side === 0) {
			perpWallDist = (mapX - player.x / TILE_SIZE + (1 - stepX) / 2) / rayDirX;
		} else {
			perpWallDist = (mapY - player.y / TILE_SIZE + (1 - stepY) / 2) / rayDirY;
		}

		// Prevent divide-by-zero
		if (perpWallDist <= 0) perpWallDist = 0.01;

		// 7) Convert distance to on‑screen slice height
		const wallHeight = Math.floor(screenHeight / perpWallDist);

		// Clamp the drawing range within the screen
		const wallStart = Math.max(0, Math.floor((screenHeight - wallHeight) / 2));
		const wallEnd = Math.min(
			screenHeight,
			Math.ceil((screenHeight + wallHeight) / 2)
		);

		// 8) Paint the vertical slice (shade by side for depth cue)
		context.fillStyle = side === 0 ? "#cccccc" : "#888888"; // Shade side walls
		context.fillRect(x, wallStart, RAY_STEP, wallEnd - wallStart);
	}
};
/*
HOW THIS FILE WORKS

Purpose
Renders the pseudo‑3D view by casting one ray per vertical screen column and
drawing a vertical wall slice sized by distance. Classic ray‑marching style.

Core Steps
1. For each column, map column index to cameraX (‑1 → +1 span across screen).
2. Derive ray direction = forwardDir + cameraPlane * cameraX.
3. Use integer DDA stepping: pick whether we cross an X boundary or Y boundary
	 next based on which accumulated side distance is smaller.
4. When we land in a wall tile we stop.
5. Compute perpendicular distance (project onto ray axis to avoid fisheye).
6. Translate distance into slice height (inverse proportion).
7. Draw the slice. Horizontal vs vertical hits get different shading so your
	 brain infers lighting/depth with zero real lights.

Math Notes (plain language)
- DDA: imagine walking along the ray; instead of tiny float steps we jump
	exactly to the next vertical or horizontal grid line each time.
- Perp distance formula comes from similar triangles; using sideDist would
	stretch edges (fisheye) because peripheral rays travel farther.
- Height ≈ screenHeight / distance – far walls appear shorter, mimicking depth.

Why This Matters
It’s extremely fast (no heavy trig inside the inner loop except initial
precomputes) and scales linearly with horizontal resolution.

Tweak Ideas
- Add texture sampling instead of flat colors.
- Add a depth buffer (array of perpWallDist) for future sprite rendering.
*/
