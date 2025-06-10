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
  environment: "dungeon", // selected by user default dungeon
  environmentPresets: {
    dungeon: {
      numRooms: 15,
      roomMinSize: 3,
      roomMaxSize: 7,
      walkerPresets: {
        branchChance: 0.1,
        loopChance: 0.05,
        minCorridor: 2,
        maxCorridor: 6,
      },
    },
    forest: {
      numRooms: 2,
      roomMinSize: 12,
      roomMaxSize: 12,
      walkerPresets: {
        branchChance: 0.35,
        loopChance: 0.2,
        minCorridor: 1,
        maxCorridor: 4,
      },
    },
    cave: {
      numRooms: 12,
      roomMinSize: 6,
      roomMaxSize: 14,
      walkerPresets: {
        branchChance: 0.05,
        loopChance: 0.01,
        minCorridor: 4,
        maxCorridor: 8,
      },
    },
    castle: {
      numRooms: 12,
      roomMinSize: 4,
      roomMaxSize: 6,
      walkerPresets: {
        branchChance: 0,
        loopChance: 0,
        minCorridor: 3,
        maxCorridor: 5,
      },
    },
  },
};
