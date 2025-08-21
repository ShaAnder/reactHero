// Deterministic seeded random helper. Falls back to Math.random if no seed.

function hashStringToUint32(str) {
	// FNV-1a style mix (fast, non-crypto)
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
	}
	return h >>> 0;
}

export function createSeededRandom(seed) {
	if (seed == null) return Math.random;
	let state = typeof seed === "string" ? hashStringToUint32(seed) : seed >>> 0;
	if (state === 0) state = 0xdeadbeef; // avoid degenerate cycle
	return function next() {
		// LCG step
		state = (1664525 * state + 1013904223) >>> 0;
		return state / 0x100000000; // [0,1)
	};
}

export function getOrCreateRng(options) {
	if (!options) return Math.random;
	if (options.rng) return options.rng;
	const rng = createSeededRandom(options.seed);
	options.rng = rng; // attach for downstream reuse
	return rng;
}

// Backward compatibility (temporary)
export const makeRng = createSeededRandom; // deprecated alias
export const ensureRng = getOrCreateRng; // deprecated alias

/*
HOW THIS FILE WORKS

Purpose:
Provide a tiny deterministic PRNG so procedural generation (maps, placements) can be reproduced with a seed.

Core Pieces:
1. hashStringToUint32(str) → Stable 32‑bit unsigned integer from any seed string.
2. createSeededRandom(seed) → Returns a closure producing floats in [0,1) using an LCG.
3. getOrCreateRng(options) → Convenience: attaches rng to a config object if missing.

Algorithm (LCG):
 state = (A * state + C) mod 2^32
 We then scale to [0,1) by dividing by 2^32.
 Constants (1664525, 1013904223) are classic "Numerical Recipes" values: fast, decent distribution for lightweight game usage.

Why not crypto / PCG / Mulberry32?
 - LCG is sufficient for visual map variation and extremely small footprint.
 - We can swap implementation later behind the same public functions if quality needs rise.

Design Notes:
 - Strings and numbers both accepted for convenience.
 - Null/undefined seed returns Math.random to keep call sites simple.
 - Defensive non‑zero seed ensures we don't lock into a short cycle.
 - Expose backward compatibility aliases (makeRng / ensureRng) during transition.

Usage Pattern:
 const config = { seed: 'run-42' };
 const rng = getOrCreateRng(config);
 const value = rng();
 (Downstream functions reuse config.rng without re-hashing.)

Removal Plan:
 - After refactoring all imports to new names, remove legacy aliases.
*/
