/*
HOW THIS FUNCTION WORKS
Lloyd style relaxation: for each iteration, move every seed to the centroid
of the tiles currently assigned to it, then recompute assignments. Spreads
seeds more evenly and reduces clumping.
*/
export const relaxSeeds = (seeds, regionMap, dimensions, iterations = 1) => {
	for (let iter = 0; iter < iterations; iter++) {
		const newSeeds = [];
		for (let i = 0; i < seeds.length; i++) {
			let sumX = 0,
				sumY = 0,
				count = 0;
			for (let y = 0; y < dimensions; y++) {
				for (let x = 0; x < dimensions; x++) {
					if (regionMap[y][x] === i) {
						sumX += x;
						sumY += y;
						count++;
					}
				}
			}
			if (count > 0) {
				newSeeds.push({
					x: Math.round(sumX / count),
					y: Math.round(sumY / count),
				});
			} else {
				newSeeds.push(seeds[i]); // fallback if region is empty
			}
		}
		// Reassign regions to new seeds
		for (let y = 0; y < dimensions; y++) {
			for (let x = 0; x < dimensions; x++) {
				let minDist = Infinity,
					closest = 0;
				for (let i = 0; i < newSeeds.length; i++) {
					const dx = newSeeds[i].x - x;
					const dy = newSeeds[i].y - y;
					const dist = dx * dx + dy * dy;
					if (dist < minDist) {
						minDist = dist;
						closest = i;
					}
				}
				regionMap[y][x] = closest;
			}
		}
		seeds = newSeeds;
	}
	return seeds;
};

/*
SUMMARY
Loop: compute centroid per region -> move seed there (rounded) -> rebuild
region assignments using squared distance. Empty region? keep original seed.
*/
