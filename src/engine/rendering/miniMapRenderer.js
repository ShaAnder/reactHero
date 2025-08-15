import { TILE_SIZE } from "../../../gameConfig";

// This function draws a scrolling minimap that always keeps the player in the center.
// Only a chunk of the map is shown at once, and it smoothly follows the player's movement.
//
// context: CanvasRenderingContext2D to draw on
// player: player object with x, y (in pixels) and angle (in radians)
// map: 2D array of the level (0 = floor, 1 = wall)

export const renderMinimap = (context, player, map) => {
	// Bail if map is empty or missing
	if (!map || !map.length || !map[0].length) return;

	// Minimap settings: how many tiles are visible, how big each tile is, and margin from the edge
	const MINIMAP_TILE_SIZE = 9;
	const VIEWPORT_TILES = 15;
	const MINIMAP_SIZE = VIEWPORT_TILES * MINIMAP_TILE_SIZE;
	const MINIMAP_MARGIN = 20;

	// Get map dimensions
	const MAP_NUM_ROWS = map.length;
	const MAP_NUM_COLS = map[0].length;

	// Figure out where to draw the minimap box (top-right corner, with a margin)
	const minimapX = context.canvas.width - MINIMAP_SIZE - MINIMAP_MARGIN;
	const minimapY = MINIMAP_MARGIN;

	// Draw the minimap background
	context.fillStyle = "#111";
	context.fillRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

	// Clip drawing to the minimap area so nothing spills out
	context.save();
	context.beginPath();
	context.rect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);
	context.clip();

	// Center the minimap camera on the player (convert player pixel pos to tile units)
	const cameraCenterTileX = player.x / TILE_SIZE;
	const cameraCenterTileY = player.y / TILE_SIZE;

	// Figure out which tile is at the top-left of the minimap view
	const topLeftTileX = cameraCenterTileX - VIEWPORT_TILES / 2;
	const topLeftTileY = cameraCenterTileY - VIEWPORT_TILES / 2;
	const startCol = Math.floor(topLeftTileX);
	const startRow = Math.floor(topLeftTileY);

	// Sub-tile offset for smooth scrolling as the player moves between tiles
	const offsetX = (topLeftTileX - startCol) * MINIMAP_TILE_SIZE;
	const offsetY = (topLeftTileY - startRow) * MINIMAP_TILE_SIZE;

	// Loop through just the visible tiles in the minimap viewport
	for (let row = 0; row <= VIEWPORT_TILES; row++) {
		for (let col = 0; col <= VIEWPORT_TILES; col++) {
			const mapRow = startRow + row;
			const mapCol = startCol + col;

			// Skip tiles that are outside the actual map
			if (
				mapRow < 0 ||
				mapRow >= MAP_NUM_ROWS ||
				mapCol < 0 ||
				mapCol >= MAP_NUM_COLS
			)
				continue;

			const tileType = map[mapRow][mapCol];

			// Calculate where to draw this tile on the minimap
			const drawX = minimapX + col * MINIMAP_TILE_SIZE - offsetX;
			const drawY = minimapY + row * MINIMAP_TILE_SIZE - offsetY;

			// Draw wall tiles dark, floor tiles white
			context.fillStyle = tileType === 1 ? "#222" : "#fff";
			context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
		}
	}

	// Restore context to remove the minimap clipping
	context.restore();

	// Draw a border around the minimap for style
	context.lineWidth = 2;
	context.strokeStyle = "black";
	context.strokeRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

	// Draw the player as a red dot in the center of the minimap
	const centerX = minimapX + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;
	const centerY = minimapY + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;

	context.fillStyle = "red";
	context.beginPath();
	context.arc(centerX, centerY, MINIMAP_TILE_SIZE / 2, 0, Math.PI * 2);
	context.fill();

	// Draw a line showing the player's facing direction
	context.strokeStyle = "red";
	context.beginPath();
	context.moveTo(centerX, centerY);
	context.lineTo(
		centerX + Math.cos(player.angle) * MINIMAP_TILE_SIZE,
		centerY + Math.sin(player.angle) * MINIMAP_TILE_SIZE
	);
	context.stroke();
};

/*
How this file works:

This function renders a dynamic minimap that scrolls with the player, acting like a little moving camera that shows only a piece of the world map. The minimap is always centered on the player’s position, and smoothly scrolls as the player moves—even between tiles—thanks to fractional offsets. The visible area is a square chunk of the map, and only those tiles are drawn for performance. Walls and floors are colored differently, and the player’s position is always marked in the center with a red dot and a little direction line. The minimap is clipped so nothing draws outside its box, and a border is added for a clean look.

Math summary:
- The minimap camera is centered on the player by converting their pixel position to tile units.
- Sub-tile offsets allow for smooth scrolling, not just tile-by-tile jumps.
- Only the visible chunk of the map is drawn, improving performance and clarity.

This setup gives players a clear, limited view of their surroundings without revealing the whole map
*/
