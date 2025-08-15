// These constants set the reference game window size in pixels.
// NOTE: The actual game now uses full viewport dimensions dynamically.
// These are kept for reference and potential future use.
export const WINDOW_WIDTH = 1600;
export const WINDOW_HEIGHT = 900;

// This defines how big each square tile is on the map, in pixels.
// All map layouts and player movement will use this as the base unit.
export const TILE_SIZE = 64;

// Here we set the player's field of view (FOV).
// 60 degrees is converted to radians because that's what most math functions use.
// The formula is: degrees * (π / 180)
export const FOV_ANGLE = (60 * Math.PI) / 180;

// These two constants handle the game's frame timing.
// TARGET_FPS is how many frames we want per second (smoothness).
// FRAME_DURATION is how long each frame should last, in milliseconds.
export const TARGET_FPS = 60;
export const FRAME_DURATION = 1000 / TARGET_FPS;

// MAP GENERATION CONFIG
// Default map config for creating our map, we want diff presents for the generator based on
// what the user wants to play.
export const DEFAULT_MAP_CONFIG = {
	dimensions: 64,
	environment: "forest",
	environmentPresets: {
		forest: {
			numRegions: 21,
			clearingSize: [2, 4],
			voronoiRelaxation: 10,
			walkerPresets: {
				branchChance: 0.05,
				loopChance: 0.08,
				minCorridor: 3,
				maxCorridor: 5,
				allowDiagonals: true,
			},
		},
		cavern: {
			fillProbability: 0.55,
			caIterations: 5,
			useTunnels: true,
			walkerPresets: {
				branchChance: 0.15,
				loopChance: 0.08,
				minCorridor: 2,
				maxCorridor: 4,
				allowDiagonals: false,
			},
		},
	},
};
