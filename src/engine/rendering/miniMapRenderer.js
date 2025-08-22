import { TILE_SIZE } from "../../../gameConfig";
import {
	MINIMAP_BG,
	MINIMAP_WALL,
	MINIMAP_FLOOR,
	MINIMAP_MARKER,
	MINIMAP_OUTLINE,
} from "../../constants/colors";

// Scrolling minimap (player fixed in center, world scrolls underneath).
// Shows only a square window of tiles for clarity + performance.

export const renderMinimap = (context, player, map) => {
	// No map yet? Nothing to draw.
	if (!map || !map.length || !map[0].length) return;

	// Core layout settings (viewport footprint + tile pixel size)
	const MINIMAP_TILE_SIZE = 9;
	const VIEWPORT_TILES = 15;
	const MINIMAP_SIZE = VIEWPORT_TILES * MINIMAP_TILE_SIZE;
	const MINIMAP_MARGIN = 20;

	// Whole map bounds
	const MAP_NUM_ROWS = map.length;
	const MAP_NUM_COLS = map[0].length;

	// Anchor the minimap top‑right with a margin
	const minimapX = context.canvas.width - MINIMAP_SIZE - MINIMAP_MARGIN;
	const minimapY = MINIMAP_MARGIN;

	// Background panel
	context.fillStyle = MINIMAP_BG;
	context.fillRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

	// Constrain all tile draws inside the panel rectangle
	context.save();
	context.beginPath();
	context.rect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);
	context.clip();

	// Player position in tile coordinates (fractional → enables smooth scroll)
	const cameraCenterTileX = player.x / TILE_SIZE;
	const cameraCenterTileY = player.y / TILE_SIZE;

	// Top‑left tile coordinate of the window
	const topLeftTileX = cameraCenterTileX - VIEWPORT_TILES / 2;
	const topLeftTileY = cameraCenterTileY - VIEWPORT_TILES / 2;
	const startCol = Math.floor(topLeftTileX);
	const startRow = Math.floor(topLeftTileY);

	// Sub‑tile fractional offsets so scroll is smooth (not jumpy per tile)
	const offsetX = (topLeftTileX - startCol) * MINIMAP_TILE_SIZE;
	const offsetY = (topLeftTileY - startRow) * MINIMAP_TILE_SIZE;

	// Loop only visible window (avoid iterating whole map each frame)
	for (let row = 0; row <= VIEWPORT_TILES; row++) {
		for (let col = 0; col <= VIEWPORT_TILES; col++) {
			const mapRow = startRow + row;
			const mapCol = startCol + col;

			// Skip anything outside map bounds
			if (
				mapRow < 0 ||
				mapRow >= MAP_NUM_ROWS ||
				mapCol < 0 ||
				mapCol >= MAP_NUM_COLS
			)
				continue;

			const tileType = map[mapRow][mapCol];

			// Pixel destination inside minimap panel
			const drawX = minimapX + col * MINIMAP_TILE_SIZE - offsetX;
			const drawY = minimapY + row * MINIMAP_TILE_SIZE - offsetY;

			// Simple palette: dark = wall, light = walkable
			context.fillStyle = tileType === 1 ? MINIMAP_WALL : MINIMAP_FLOOR;
			context.fillRect(drawX, drawY, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
		}
	}

	// Remove clipping region
	context.restore();

	// Thin outline
	context.lineWidth = 2;
	context.strokeStyle = MINIMAP_OUTLINE;
	context.strokeRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

	// Player marker (always centered)
	const centerX = minimapX + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;
	const centerY = minimapY + (VIEWPORT_TILES / 2) * MINIMAP_TILE_SIZE;

	context.fillStyle = MINIMAP_MARKER;
	context.beginPath();
	context.arc(centerX, centerY, MINIMAP_TILE_SIZE / 2, 0, Math.PI * 2);
	context.fill();

	// Tiny facing direction line
	context.strokeStyle = MINIMAP_MARKER;
	context.beginPath();
	context.moveTo(centerX, centerY);
	context.lineTo(
		centerX + Math.cos(player.angle) * MINIMAP_TILE_SIZE,
		centerY + Math.sin(player.angle) * MINIMAP_TILE_SIZE
	);
	context.stroke();
};
/*
HOW THIS FILE WORKS

Goal
Provide a compact, always‑centered window of the surrounding dungeon so the
player can orient without revealing the entire layout at once.

Key Ideas
- The player sits visually fixed in the middle; world tiles scroll.
- We compute the fractional (not just integer) tile position for smooth
	motion while moving between grid squares.
- Only a small square of tiles is iterated – big maps stay cheap.
- Clipping keeps drawing contained to a neat panel.

Math (plain language)
- Player pixel position → divide by TILE_SIZE → tile coordinates with
	decimals (e.g. 10.42). That fractional part becomes an offset so we slide
	tiles instead of snapping each time we cross into a new tile.

Future Enhancements
- Fog of war (mask unexplored tiles).
- Color coding exits, spawn, enemies.
- Toggle visibility with a key or dev flag.
*/
