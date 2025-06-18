// These constants set the main game window size in pixels.
// You can tweak these to change how big the game appears on screen.
export const WINDOW_WIDTH = 1280;
export const WINDOW_HEIGHT = 720;

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
  dimensions: 65,
  environment: "dungeon", // default
  environmentPresets: {
    forest: {
      numRegions: 10,
      regionMinSize: 6,
      regionMaxSize: 12,
      generationStyle: "voronoi",
    },
    cave: {
      fillProbability: 0.45,
      caIterations: 5,
      generationStyle: "cellular_automata",
    },
    dungeon: {
      numRooms: 15,
      roomMinSize: 3,
      roomMaxSize: 7,
      walkerPresets: {
        branchChance: 0.1,
        loopChance: 0.05,
        minCorridor: 2,
        maxCorridor: 6,
        allowDiagonals: false,
      },
      generationStyle: "rooms_corridors",
    },
    castle: {
      numRegions: 8,
      regionMinSize: 6,
      regionMaxSize: 10,
      generationStyle: "voronoi",
      regular: true, // for more grid-like rooms
    },
  },
};
