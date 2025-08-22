// Procedural generation tuning knobs.

// General/random walker
export const SHUFFLE_BIAS = 0.5; // sort comparator/coin flips center
export const TURN_CHANCE = 0.5; // random turn chance for walkers
export const ORGANIC_ROOM_JITTER = 0.5; // radial jitter factor (±50%)

// Forest defaults and thresholds
export const FOREST_PADDING = 5;
export const FOREST_SPAWN_SIZE = 3;
export const FOREST_MAX_ATTEMPTS = 60;
export const FOREST_EXIT_MIN_DIST = 40;
export const FOREST_SEED_SPACING = 2; // min tile spacing between seeds
export const FOREST_SEED_TRIES_MAX = 10;
export const FOREST_DIM_DEFAULT = 65;
export const FOREST_NUM_CLEARINGS_DEFAULT = 10;
export const FOREST_CLEARING_SIZE_MIN = 1;
export const FOREST_CLEARING_SIZE_MAX = 2;

// Cavern defaults and thresholds
export const CAVERN_FILL_PROB_DEFAULT = 0.45;
export const CAVERN_CA_ITERATIONS_DEFAULT = 5;
export const CAVERN_PADDING = 5;
export const CAVERN_SPAWN_SIZE = 3;
export const CAVERN_FLOORCOUNT_MIN = 10;
export const CAVERN_REACHABLE_MIN = 10;
export const CAVERN_MAX_ATTEMPTS = 60;
export const CAVERN_EXIT_MIN_DIST = 40;

// Helper defaults
export const FURTHEST_MIN_DIST_DEFAULT = 20;
export const CA_WALL_THRESHOLD = 4; // classic 4/5 rule

/*
HOW THIS FILE WORKS
Keep generation-related magic numbers here so we can tweak map feel without
hunting through algorithms. Values are intentionally simple and documented by
intent rather than exact formulas.
*/
