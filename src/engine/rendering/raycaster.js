import { TILE_SIZE } from "../../../gameConfig";

// This is the main 2.5D raycasting renderer, using the DDA (Digital Differential Analyzer) algorithm.
// For each vertical slice of the screen, I cast a ray into the map to figure out where it hits a wall.
// The distance to the wall determines how tall to draw the wall slice, creating the illusion of 3D.
//
// The DDA algorithm is perfect for this because it efficiently steps through each tile the ray passes through,
// letting me quickly find the first wall hit without missing any cells[1][2][3][4][5].

export const rayCaster = ({
	player,
	planeX,
	planeY,
	screenWidth,
	screenHeight,
	map,
	context,
}) => {
	// quick check to see if map is ready
	if (!map || !Array.isArray(map) || !map.length) {
		return;
	}

	// Controls how sharp the image is (1 pixel per ray is sharpest)
	const RAY_STEP = 1;

	// Precompute player direction for efficiency
	const cosAngle = Math.cos(player.angle);
	const sinAngle = Math.sin(player.angle);

	// Loop over every vertical column on the screen
	for (let x = 0; x < screenWidth; x += RAY_STEP) {
		// --- 1. Find the direction of this ray ---
		// cameraX goes from -1 (left) to 1 (right) across the screen
		const cameraX = (2 * x) / screenWidth - 1;

		// The final ray direction is player direction + camera plane offset
		const rayDirX = cosAngle + planeX * cameraX;
		const rayDirY = sinAngle + planeY * cameraX;

		// --- 2. Find which map cell the player is in ---
		let mapX = (player.x / TILE_SIZE) | 0;
		let mapY = (player.y / TILE_SIZE) | 0;

		// --- 3. How far does the ray have to travel to cross each gridline? ---
		const deltaDistX = Math.abs(1 / rayDirX);
		const deltaDistY = Math.abs(1 / rayDirY);

		// --- 4. Set up stepping for DDA ---
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

		// --- 5. DDA loop: Step through the grid until hitting a wall ---
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

		// --- 6. Get the perpendicular distance to the wall (to avoid fisheye effect) ---
		let perpWallDist;
		if (side === 0) {
			perpWallDist = (mapX - player.x / TILE_SIZE + (1 - stepX) / 2) / rayDirX;
		} else {
			perpWallDist = (mapY - player.y / TILE_SIZE + (1 - stepY) / 2) / rayDirY;
		}

		// Prevent divide-by-zero
		if (perpWallDist <= 0) perpWallDist = 0.01;

		// --- 7. Use distance to set wall height on the screen ---
		const wallHeight = Math.floor(screenHeight / perpWallDist);

		// Clamp the drawing range within the screen
		const wallStart = Math.max(0, Math.floor((screenHeight - wallHeight) / 2));
		const wallEnd = Math.min(
			screenHeight,
			Math.ceil((screenHeight + wallHeight) / 2)
		);

		// --- 8. Draw the vertical wall slice ---
		context.fillStyle = side === 0 ? "#cccccc" : "#888888"; // Shade side walls
		context.fillRect(x, wallStart, RAY_STEP, wallEnd - wallStart);
	}
};

/*
How this file works:

This is the heart of the 2.5D effect—the raycasting renderer! For every vertical column on the screen, I shoot a ray into the map, using the DDA algorithm to step through each tile along the ray’s path. As soon as the ray hits a wall, I calculate how far it traveled and use that distance to scale the wall’s height on the screen. The farther away the wall, the shorter it appears, creating a 3D illusion. I shade vertical and horizontal walls differently for extra depth. The DDA algorithm is super efficient for this because it always finds the next cell the ray will cross, making it perfect for real-time games[1][2][3][4][5].

Math summary:
- DDA (Digital Differential Analyzer) steps through the grid, always finding the next cell the ray would hit.
- Perpendicular distance correction is used to avoid the fisheye effect, so walls look straight even at the edges.
- Wall height is inversely proportional to distance: wallHeight = screenHeight / perpWallDist.
- The camera plane and cameraX math let me simulate a field of view and perspective.

*/
