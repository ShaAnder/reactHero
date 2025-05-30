// Game window size in pixels
export const WINDOW_WIDTH = 1280;
export const WINDOW_HEIGHT = 720;

// Size of each square tile on the map (in pixels)
export const TILE_SIZE = 64;

// Player's field of view (60 degrees in radians)
export const FOV_ANGLE = (60 * Math.PI) / 180;

// Target framerate / Ideal duration of one frame in ms
export const TARGET_FPS = 60;
export const FRAME_DURATION = 1000 / TARGET_FPS;

// MAP GENERATION CONFIG (for testing / default setup)
export const DEFAULT_MAP_CONFIG = {
  dimensions: 64, // Map size (64x64)
  numRooms: 20, // Number of rooms to try generating
  maxTunnels: 100, // Max random walker steps
  roomMinSize: 3, // Min room dimension
  roomMaxSize: 8, // Max room dimension
};
