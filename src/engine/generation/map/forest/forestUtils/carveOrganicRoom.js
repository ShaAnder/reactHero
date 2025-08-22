/*
HOW THIS FUNCTION WORKS
Carve an organic (blobby) clearing centered at (centerX, centerY).
We scan a square around the center, compute radial distance, then compare
against a jittered radius so the edge wobbles and feels natural.
*/
import { getOrCreateRng } from "../../../../../utils/rng";
import { ORGANIC_ROOM_JITTER } from "../../../../../constants/generation";

export const carveOrganicClearing = (map, centerX, centerY, baseRadius, options = {}) => {
	const rows = map.length;
	const cols = map[0].length;
	let carved = false;

	for (let y = -baseRadius; y <= baseRadius; y++) {
		for (let x = -baseRadius; x <= baseRadius; x++) {
			const nx = centerX + x;
			const ny = centerY + y;
			// Stay off the extreme border so later logic can rely on wall frame
			if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
				const dist = Math.sqrt(x * x + y * y);
				// Jitter the target radius by +/- jitter factor for a wavy edge.
				const rng = getOrCreateRng(options);
				const jitter = (rng() - 0.5) * (baseRadius * ORGANIC_ROOM_JITTER);
				const edge = baseRadius + jitter;
				if (dist < edge) {
					map[ny][nx] = 0;
					carved = true;
				}
			}
		}
	}
	return carved ? [centerY, centerX] : null;
};

/*
SUMMARY
Dist < (baseRadius +/- random wiggle) => carve floor. Returns center if we
actually carved anything, else null so caller can retry/skip gracefully.
*/
