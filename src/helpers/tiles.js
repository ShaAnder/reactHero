// Tile coordinate helpers centralizing world<->tile math.
import { TILE_SIZE } from "../../gameConfig";

// Convert world pixel (x,y) to integer tile indices [tx, ty]
export function worldToTile(x, y) {
	return [Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE)];
}

// Compare two tile coords given as [x,y]
export function sameTile(a, b) {
	return a && b && a[0] === b[0] && a[1] === b[1];
}

/*
HOW THIS FILE WORKS

Small utilities to prevent repeating floor(x / TILE_SIZE) all over and reduce
ordering mistakes. We standardize on external coordinate order [x, y].
*/
