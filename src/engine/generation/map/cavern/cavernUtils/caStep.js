import { getBlankMap } from "../../utils/getBlankMap";

/*
HOW THIS FUNCTION WORKS
One cellular automata smoothing pass:
- Look at each cell’s 8 neighbors (treat out‑of‑bounds as walls so edges close).
- Count how many are walls.
- If > 4, keep / become wall; else become floor. (Classic “4/5 rule”.)
This biases isolated floors into walls and preserves larger open pockets.
Return a fresh grid (no in‑place mutation) so multiple passes compound cleanly.
*/
export const caStep = (map) => {
	const rows = map.length;
	const cols = map[0].length;
	const newMap = getBlankMap(1, rows); // start all walls, we'll flip to 0 when open
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			let wallCount = 0;
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					if (dy === 0 && dx === 0) continue; // skip self
					const ny = y + dy;
					const nx = x + dx;
					if (
						ny < 0 ||
						ny >= rows ||
						nx < 0 ||
						nx >= cols ||
						map[ny][nx] === 1
					) {
						wallCount++;
					}
				}
			}
			newMap[y][x] = wallCount > 4 ? 1 : 0;
		}
	}
	return newMap;
};
