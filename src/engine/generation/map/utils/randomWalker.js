/*
HOW THIS FILE WORKS / RANDOM WALK CORRIDORS
We connect room centers using two passes:
1. Phase 1: carve guaranteed connectivity (minimal wandering) directly between
  successive shuffled room centers.
2. Phase 2: revisit pairs adding optional branches (dead‑end flavor) and loops
  (alternate routes) based on probabilities.
Result: every room is reachable, with some organic variation.
*/

export const initRandomWalker = (map, roomCenters, options) => {
	const { branchChance, loopChance, minCorridor, maxCorridor } = options;

	const directions = [
		[-1, 0], // up
		[0, 1], // right
		[1, 0], // down
		[0, -1], // left
	];

	const isInside = (y, x) =>
		y > 0 && y < map.length - 1 && x > 0 && x < map[0].length - 1;

	// Shuffle the room list so the order is random every time
	const shuffledRooms = roomCenters.slice().sort(() => Math.random() - 0.5);

	// PHASE 1: straight(ish) connections for guaranteed reachability
	for (let i = 0; i < shuffledRooms.length - 1; i++) {
		let [y, x] = shuffledRooms[i];
		const [targetY, targetX] = shuffledRooms[i + 1];

		// Always reach the next room center before doing any loops/branches
		while (x !== targetX || y !== targetY) {
			// Pick a random corridor length for this segment
			const steps =
				minCorridor +
				Math.floor(Math.random() * (maxCorridor - minCorridor + 1));

			for (let s = 0; s < steps; s++) {
				if (x === targetX && y === targetY) break;
				if (isInside(y, x)) map[y][x] = 0;

				// Move one step in the current direction
				let dir = pickInitDir(y, x, targetY, targetX);
				const ny = y + dir[0];
				const nx = x + dir[1];

				if (isInside(ny, nx)) {
					y = ny;
					x = nx;
					map[y][x] = 0;
				} else {
					break;
				}
			}
		}
	}

	// PHASE 2: add optional branching + loops for interest and alternate paths
	for (let i = 0; i < shuffledRooms.length - 1; i++) {
		let [y, x] = shuffledRooms[i];
		const [targetY, targetX] = shuffledRooms[i + 1];

		while (x !== targetX || y !== targetY) {
			const steps =
				minCorridor +
				Math.floor(Math.random() * (maxCorridor - minCorridor + 1));

			for (let s = 0; s < steps; s++) {
				if (x === targetX && y === targetY) break;
				if (isInside(y, x)) map[y][x] = 0;

				// Move one step in the current direction
				let dir = pickInitDir(y, x, targetY, targetX);
				const ny = y + dir[0];
				const nx = x + dir[1];

				if (isInside(ny, nx)) {
					y = ny;
					x = nx;
					map[y][x] = 0;

					// Branches and loops only in phase 2
					if (Math.random() < branchChance) {
						const [dy, dx] =
							directions[Math.floor(Math.random() * directions.length)];
						const by = y + dy;
						const bx = x + dx;
						if (isInside(by, bx)) map[by][bx] = 0;
					}

					if (Math.random() < loopChance && roomCenters.length > 2) {
						const randRoom =
							roomCenters[Math.floor(Math.random() * roomCenters.length)];
						y = randRoom[0];
						x = randRoom[1];
						break;
					}
				} else {
					break;
				}
			}
		}
	}
};

// Rough direction toward target (bias vertical vs horizontal randomly)
const pickInitDir = (y, x, targetY, targetX) => {
	const dy = targetY > y ? 1 : targetY < y ? -1 : 0;
	const dx = targetX > x ? 1 : targetX < x ? -1 : 0;
	// Randomly choose to prioritize vertical or horizontal movement
	if (Math.random() < 0.5) {
		return [dy, 0];
	} else {
		return [0, dx];
	}
};

/*
SUMMARY
Guaranteed pass ensures connectivity; second pass spices things up with random
branches (dead ends) and loop teleports to random rooms, forging cycles.
*/
