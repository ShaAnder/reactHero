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
// This object holds the default settings for generating a map.
// These are hardcoded for now, but in the future users will be able to pick their own options.
export const DEFAULT_MAP_CONFIG = {
  // Map will be 64x64 tiles
  dimensions: 64,
  // The generator will try to create up to 20 rooms
  numRooms: 15,
  // This limits how many steps the random walker can take when making tunnels
  maxTunnels: 100,
  // Smallest possible room size
  roomMinSize: 3,
  // Largest possible room size
  roomMaxSize: 8,
};
